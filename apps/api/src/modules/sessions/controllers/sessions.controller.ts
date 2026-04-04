import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { SessionStatus } from '@prisma/client';
import { SessionsService } from '../services/sessions.service';
import {
  CreateSessionDto,
  SendMessageDto,
  SessionListResponseDto,
  SessionDetailResponseDto,
} from '../dto/session.dto';
import { AuthGuard } from '@/shared/auth';
import { OrganizationId } from '../../../shared/decorators/organization.decorator';
import { ApiRateLimit } from '../../../shared/decorators/throttle.decorator';

@ApiTags('Sessions')
@ApiBearerAuth('bearer')
@Controller('api/v1/sessions')
@UseGuards(AuthGuard)
@ApiRateLimit()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new agent session' })
  @ApiResponse({ status: 201, type: SessionDetailResponseDto })
  async create(
    @OrganizationId() organizationId: string,
    @Body() dto: CreateSessionDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).userId || 'system';
    const session = await this.sessionsService.create(
      organizationId,
      userId,
      dto,
    );
    return { session };
  }

  @Get()
  @ApiOperation({ summary: 'List agent sessions' })
  @ApiResponse({ status: 200, type: SessionListResponseDto })
  @ApiQuery({ name: 'status', required: false, enum: SessionStatus })
  @ApiQuery({ name: 'projectId', required: false })
  async findAll(
    @OrganizationId() organizationId: string,
    @Query('status') status?: SessionStatus,
    @Query('projectId') projectId?: string,
  ) {
    const sessions = await this.sessionsService.findAll(organizationId, {
      status,
      projectId,
    });
    return { sessions };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent session with messages' })
  @ApiResponse({ status: 200, type: SessionDetailResponseDto })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async findOne(
    @OrganizationId() organizationId: string,
    @Param('id') id: string,
  ) {
    const session = await this.sessionsService.findOne(organizationId, id);
    return { session };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete agent session' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async remove(
    @OrganizationId() organizationId: string,
    @Param('id') id: string,
  ) {
    // TODO: Also stop container via SessionContainerService
    await this.sessionsService.remove(organizationId, id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message to the agent session' })
  @ApiResponse({ status: 200, description: 'Message sent, response streaming via WebSocket' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 409, description: 'Agent is already processing' })
  async sendMessage(
    @OrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    // TODO: Wire with SessionContainerService for Claude Code execution
    const session = await this.sessionsService.findOne(organizationId, id);

    if (session.status !== 'RUNNING') {
      throw new Error('Session is not running');
    }

    if (!this.sessionsService.acquireExecLock(id)) {
      throw new Error('Agent is already processing a message');
    }

    try {
      await this.sessionsService.saveMessage(id, 'user', dto.content);
      await this.sessionsService.touchLastActive(id);

      // TODO: Execute Claude Code in container and stream response
      return { status: 'processing' };
    } finally {
      this.sessionsService.releaseExecLock(id);
    }
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause agent session' })
  async pause(
    @OrganizationId() organizationId: string,
    @Param('id') id: string,
  ) {
    const session = await this.sessionsService.findOne(organizationId, id);
    if (session.status !== 'RUNNING') {
      throw new Error('Can only pause a running session');
    }
    await this.sessionsService.updateStatus(id, 'PAUSED');
    return { status: 'paused' };
  }

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume agent session' })
  async resume(
    @OrganizationId() organizationId: string,
    @Param('id') id: string,
  ) {
    const session = await this.sessionsService.findOne(organizationId, id);
    if (session.status !== 'PAUSED') {
      throw new Error('Can only resume a paused session');
    }
    // TODO: Verify container is still running, restart if needed
    await this.sessionsService.updateStatus(id, 'RUNNING');
    return { status: 'running' };
  }

  @Post(':id/stop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stop and complete agent session' })
  async stop(
    @OrganizationId() organizationId: string,
    @Param('id') id: string,
  ) {
    const session = await this.sessionsService.findOne(organizationId, id);
    if (session.status !== 'RUNNING' && session.status !== 'PAUSED') {
      throw new Error('Session is already stopped');
    }
    // TODO: Stop and remove container via SessionContainerService
    await this.sessionsService.updateStatus(id, 'COMPLETED');
    return { status: 'completed' };
  }

  @Get(':id/files')
  @ApiOperation({ summary: 'Get file tree from session container' })
  @ApiResponse({ status: 200, description: 'File tree' })
  async getFiles(
    @OrganizationId() organizationId: string,
    @Param('id') id: string,
    @Query('path') path?: string,
  ) {
    await this.sessionsService.findOne(organizationId, id);
    // TODO: Implement via SessionContainerService.getFileTree()
    return { files: [] };
  }
}
