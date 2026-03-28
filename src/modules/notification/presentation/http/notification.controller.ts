import {
  Controller,
  Post,
  Body,
  Param,
  Sse,
  MessageEvent,
  OnModuleDestroy,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ActiveUser, ResponseMessage, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { RolesGuard } from '@/modules/auth/infrastructure/guards';
import { SseService } from '@/modules/notification/infrastructure/sse.service';
import { SendProjectWarningCommand } from '@/modules/notification/application/commands/send-project-warning.command';
import { BroadcastNotificationCommand } from '@/modules/notification/application/commands/broadcast-notification.command';
import { SendProjectWarningDto } from '../dtos/send-project-warning.dto';
import { BroadcastNotificationDto } from '../dtos/broadcast-notification.dto';
import { SendProjectWarningResult } from '@/modules/notification/application/handlers/send-project-warning.handler';
import { BroadcastNotificationResult } from '@/modules/notification/application/handlers/broadcast-notification.handler';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller()
export class NotificationController implements OnModuleDestroy {
  private readonly connectionMap = new Map<string, string>(); // requestId -> userId

  constructor(
    private readonly commandBus: CommandBus,
    private readonly sseService: SseService,
  ) {}

  // -----------------------------------------------------------------------
  // SSE Stream – each authenticated user subscribes to their own stream
  // -----------------------------------------------------------------------
  @Sse('notifications/stream')
  @ApiOperation({ summary: 'Subscribe to real-time notifications via SSE' })
  stream(
    @ActiveUser('id') userId: string,
    @Req() req: Request,
  ): Observable<MessageEvent> {
    const stream$ = this.sseService.getStream(userId);

    // Close stream when client disconnects
    req.on('close', () => this.sseService.closeStream(userId));

    return stream$.pipe(
      map((event) => ({
        type: event.type,
        data: event.data,
      })),
    );
  }

  // -----------------------------------------------------------------------
  // POST /notifications/send – general broadcast
  // -----------------------------------------------------------------------
  @Post('notifications/send')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.LECTURER)
  @UseGuards(RolesGuard)
  @ResponseMessage('Notification broadcast sent')
  @ApiOperation({ summary: 'Send a general broadcast notification' })
  @ApiResponse({ status: 201 })
  async broadcastNotification(
    @ActiveUser('id') senderId: string,
    @Body() dto: BroadcastNotificationDto,
  ): Promise<BroadcastNotificationResult> {
    return this.commandBus.execute<
      BroadcastNotificationCommand,
      BroadcastNotificationResult
    >(
      new BroadcastNotificationCommand(
        senderId,
        dto.title,
        dto.message,
        dto.recipientIds ?? [],
      ),
    );
  }

  // -----------------------------------------------------------------------
  // POST /projects/:projectId/students/:studentId/warn – targeted warning
  // -----------------------------------------------------------------------
  @Post('projects/:projectId/students/:studentId/warn')
  @Roles(UserRole.LECTURER)
  @UseGuards(RolesGuard)
  @ResponseMessage('Warning sent to student')
  @ApiOperation({
    summary: 'Send a warning notification to a student in a project',
  })
  @ApiResponse({ status: 201 })
  async warnStudent(
    @ActiveUser('id') lecturerId: string,
    @Param('projectId') projectId: string,
    @Param('studentId') studentId: string,
    @Body() dto: SendProjectWarningDto,
  ): Promise<SendProjectWarningResult> {
    return this.commandBus.execute<
      SendProjectWarningCommand,
      SendProjectWarningResult
    >(
      new SendProjectWarningCommand(
        projectId,
        studentId,
        lecturerId,
        dto.message,
        dto.warningType,
      ),
    );
  }

  onModuleDestroy(): void {
    // No-op: SSE subjects clean up on client disconnect
  }
}
