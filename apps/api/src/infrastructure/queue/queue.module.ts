import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from './queues';

// Processors
import { TaskProcessingProcessor } from './processors/task-processing.processor';
import { WebhookProcessingProcessor } from './processors/webhook-processing.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { PollingProcessor } from './processors/polling.processor';

// Services
import { PollingService } from './polling.service';

// Dependencies
import { TasksModule } from '../../modules/tasks/tasks.module';
import { WorkflowsModule } from '../../modules/workflows/workflows.module';
import { PrismaModule } from '../persistence/prisma/prisma.module';

@Module({
  imports: [
    // Register all queues
    BullModule.registerQueue(
      { name: QUEUES.TASK_PROCESSING },
      { name: QUEUES.WEBHOOK_PROCESSING },
      { name: QUEUES.NOTIFICATIONS },
      { name: QUEUES.POLLING },
    ),

    // Dependencies for processors
    TasksModule,
    forwardRef(() => WorkflowsModule),
    PrismaModule,
  ],
  providers: [
    TaskProcessingProcessor,
    WebhookProcessingProcessor,
    NotificationProcessor,
    PollingProcessor,
    PollingService,
  ],
  exports: [BullModule, PollingService],
})
export class QueueModule {}
