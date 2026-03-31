import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../persistence/prisma/prisma.service';
import { QUEUES, PollingJob } from './queues';

const DEFAULT_POLLING_INTERVAL = 120_000; // 2 minutes

// Trigger types that support polling
const POLLABLE_TRIGGERS = new Set([
  'trigger:jira_issue',
  'trigger:jira_issue_created',
  'trigger:jira_status_change',
  'trigger:github_pr',
  'trigger:github_issue',
  'trigger:git_mr',
  'trigger:gitlab_mr',
]);

@Injectable()
export class PollingService implements OnModuleInit {
  private readonly logger = new Logger(PollingService.name);

  constructor(
    @InjectQueue(QUEUES.POLLING) private readonly pollingQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.syncPollingJobs();
  }

  /**
   * Sync polling jobs for all active workflows with pollable triggers.
   * Called on app startup.
   */
  async syncPollingJobs(): Promise<void> {
    // Clean up any existing repeatable jobs
    const repeatableJobs = await this.pollingQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.pollingQueue.removeRepeatableByKey(job.key);
    }

    // Find active workflows with non-manual triggers
    const workflows = await this.prisma.workflow.findMany({
      where: {
        isActive: true,
        triggerType: { not: 'manual' },
      },
    });

    let started = 0;
    for (const workflow of workflows) {
      const definition = workflow.definition as any;
      if (!definition?.nodes) continue;

      // Find trigger nodes that support polling
      const triggerNodes = definition.nodes.filter((node: any) =>
        POLLABLE_TRIGGERS.has(node.type),
      );

      for (const triggerNode of triggerNodes) {
        await this.startPolling(
          workflow.id,
          workflow.organizationId,
          triggerNode.id,
          triggerNode.type,
          triggerNode.config || {},
        );
        started++;
      }
    }

    if (started > 0) {
      this.logger.log(`Started ${started} polling jobs for active workflows`);
    }
  }

  /**
   * Start polling for a specific workflow trigger.
   */
  async startPolling(
    workflowId: string,
    organizationId: string,
    triggerNodeId: string,
    triggerType: string,
    triggerConfig: Record<string, unknown>,
  ): Promise<void> {
    if (!POLLABLE_TRIGGERS.has(triggerType)) {
      return;
    }

    const interval =
      (triggerConfig.pollingInterval as number) || DEFAULT_POLLING_INTERVAL;

    const jobData: PollingJob = {
      workflowId,
      organizationId,
      triggerNodeId,
      triggerType,
      triggerConfig,
    };

    const jobId = `poll-${workflowId}-${triggerNodeId}`;

    await this.pollingQueue.add('poll', jobData, {
      repeat: { every: interval },
      jobId,
      removeOnComplete: true,
      removeOnFail: 5,
    });

    this.logger.log(
      `Started polling for workflow ${workflowId}, trigger ${triggerType}, every ${interval / 1000}s`,
    );
  }

  /**
   * Stop polling for all triggers in a workflow.
   */
  async stopPolling(workflowId: string): Promise<void> {
    const repeatableJobs = await this.pollingQueue.getRepeatableJobs();

    for (const job of repeatableJobs) {
      if (job.id?.startsWith(`poll-${workflowId}`)) {
        await this.pollingQueue.removeRepeatableByKey(job.key);
        this.logger.log(`Stopped polling job: ${job.id}`);
      }
    }
  }
}
