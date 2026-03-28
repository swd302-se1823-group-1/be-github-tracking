import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { NotificationController } from './presentation/http/notification.controller';
import { SseService } from './infrastructure/sse.service';
import { ResendEmailService } from './infrastructure/resend-email.service';
import { SendProjectWarningHandler } from './application/handlers/send-project-warning.handler';
import { BroadcastNotificationHandler } from './application/handlers/broadcast-notification.handler';

const CommandHandlers = [
  SendProjectWarningHandler,
  BroadcastNotificationHandler,
];

@Module({
  imports: [CqrsModule, InfrastructureModule, forwardRef(() => AuthModule)],
  controllers: [NotificationController],
  providers: [...CommandHandlers, SseService, ResendEmailService],
  exports: [SseService, ResendEmailService],
})
export class NotificationModule {}
