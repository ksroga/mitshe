import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES, PollingJob } from '../queues';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { AdapterFactoryService } from '../../adapters/adapter-factory.service';
import { WorkflowOrchestratorService } from '../../../modules/workflows/engine/workflow-orchestrator.service';
import { Issue } from '../../../ports/issue-tracker.port';

@Processor(QUEUES.POLLING)
export class PollingProcessor extends WorkerHost {
  private readonly logger = new Logger(PollingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adapterFactory: AdapterFactoryService,
    private readonly orchestrator: WorkflowOrchestratorService,
  ) {
    super();
  }

  async process(job: Job<PollingJob>): Promise<void> {
    const { workflowId, organizationId, triggerType, triggerConfig } = job.data;

    try {
      // Get workflow to check if still active
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!workflow || !workflow.isActive) {
        this.logger.debug(
          `Workflow ${workflowId} no longer active, skipping poll`,
        );
        return;
      }

      // Get lastPolledAt from triggerConfig
      const config = (workflow.triggerConfig as Record<string, unknown>) || {};
      const lastPolledAt =
        (config.lastPolledAt as string) ||
        new Date(Date.now() - 120_000).toISOString();

      // Poll based on trigger type
      const items = await this.pollForChanges(
        organizationId,
        triggerType,
        triggerConfig,
        lastPolledAt,
      );

      if (items.length > 0) {
        this.logger.log(
          `Found ${items.length} new items for workflow ${workflowId} (${triggerType})`,
        );

        // Trigger workflow for each new item
        for (const item of items) {
          await this.orchestrator.triggerWorkflows(
            organizationId,
            triggerType,
            item,
          );
        }
      }

      // Update lastPolledAt
      await this.prisma.workflow.update({
        where: { id: workflowId },
        data: {
          triggerConfig: {
            ...config,
            lastPolledAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Polling failed for workflow ${workflowId}: ${(error as Error).message}`,
      );
      // Don't throw - let the job retry via BullMQ
    }
  }

  private async pollForChanges(
    organizationId: string,
    triggerType: string,
    config: Record<string, unknown>,
    since: string,
  ): Promise<Record<string, unknown>[]> {
    switch (triggerType) {
      case 'trigger:jira_issue':
      case 'trigger:jira_issue_created':
      case 'trigger:jira_status_change':
        return this.pollJira(organizationId, triggerType, config, since);

      case 'trigger:github_pr':
      case 'trigger:git_mr':
      case 'trigger:gitlab_mr':
        return this.pollMergeRequests(organizationId, config, since);

      case 'trigger:github_issue':
        return this.pollGitHubIssues(organizationId, config, since);

      default:
        this.logger.warn(`No polling handler for trigger type: ${triggerType}`);
        return [];
    }
  }

  private async pollJira(
    organizationId: string,
    triggerType: string,
    config: Record<string, unknown>,
    since: string,
  ): Promise<Record<string, unknown>[]> {
    try {
      const adapter =
        await this.adapterFactory.getDefaultIssueTracker(organizationId);
      if (!adapter) return [];

      const sinceDate = new Date(since);
      const jqlDate = sinceDate.toISOString().replace('T', ' ').slice(0, 19);

      let jql = `updated >= "${jqlDate}"`;
      if (config.projectKey) {
        jql = `project = "${config.projectKey}" AND ${jql}`;
      }
      if (triggerType === 'trigger:jira_issue_created') {
        jql = jql.replace('updated', 'created');
      }
      if (triggerType === 'trigger:jira_status_change' && config.status) {
        const statuses = Array.isArray(config.status)
          ? config.status
          : [config.status];
        jql += ` AND status IN (${statuses.map((s: string) => `"${s}"`).join(',')})`;
      }

      const result = await adapter.searchIssues({ jql, maxResults: 50 });
      return result.issues.map((issue: Issue) => ({
        issue: {
          key: issue.key,
          id: issue.id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          priority: issue.priority,
          assignee: issue.assignee,
          url: issue.url,
        },
        eventType: triggerType,
        source: 'polling',
      }));
    } catch (error) {
      this.logger.error(`Jira polling failed: ${(error as Error).message}`);
      return [];
    }
  }

  private async pollMergeRequests(
    organizationId: string,
    config: Record<string, unknown>,
    since: string,
  ): Promise<Record<string, unknown>[]> {
    try {
      const adapter =
        await this.adapterFactory.getDefaultGitProvider(organizationId);
      if (!adapter) return [];

      const repoId = config.repositoryId as string;
      if (!repoId) return [];

      const mrs = await adapter.listMergeRequests(repoId, {
        state: (config.state as 'open' | 'closed' | 'merged' | 'all') || 'open',
      });

      const sinceDate = new Date(since);
      const newMRs = mrs.filter(
        (mr: any) => new Date(mr.updatedAt || mr.createdAt) > sinceDate,
      );

      return newMRs.map((mr: any) => ({
        mergeRequest: {
          id: mr.id,
          title: mr.title,
          description: mr.description,
          state: mr.state,
          sourceBranch: mr.sourceBranch,
          targetBranch: mr.targetBranch,
          url: mr.webUrl || mr.url,
          author: mr.author,
        },
        eventType: 'trigger:git_mr',
        source: 'polling',
      }));
    } catch (error) {
      this.logger.error(`MR polling failed: ${(error as Error).message}`);
      return [];
    }
  }

  private async pollGitHubIssues(
    organizationId: string,
    config: Record<string, unknown>,
    since: string,
  ): Promise<Record<string, unknown>[]> {
    // GitHub issues are fetched via the git provider adapter's API
    // For now, delegate to Jira-style polling if there's an issue tracker
    try {
      const adapter =
        await this.adapterFactory.getDefaultIssueTracker(organizationId);
      if (!adapter) return [];

      const result = await adapter.searchIssues({
        projectKey: config.projectKey as string,
        maxResults: 50,
      });

      const sinceDate = new Date(since);
      const newIssues = result.issues.filter(
        (issue: Issue) => new Date(issue.updatedAt) > sinceDate,
      );

      return newIssues.map((issue: Issue) => ({
        issue: {
          key: issue.key,
          id: issue.id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          url: issue.url,
        },
        eventType: 'trigger:github_issue',
        source: 'polling',
      }));
    } catch (error) {
      this.logger.error(
        `GitHub issue polling failed: ${(error as Error).message}`,
      );
      return [];
    }
  }
}
