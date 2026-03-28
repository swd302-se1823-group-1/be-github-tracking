import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { SseService } from '@/modules/notification/infrastructure/sse.service';
import { ResendEmailService } from '@/modules/notification/infrastructure/resend-email.service';
import { SendProjectWarningCommand } from '../commands/send-project-warning.command';

export interface SendProjectWarningResult {
  notificationId: string;
  studentId: string;
  warningType: string;
}

@CommandHandler(SendProjectWarningCommand)
export class SendProjectWarningHandler
  implements ICommandHandler<SendProjectWarningCommand, SendProjectWarningResult>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseService: SseService,
    private readonly emailService: ResendEmailService,
  ) {}

  async execute(command: SendProjectWarningCommand): Promise<SendProjectWarningResult> {
    const { projectId, studentId, senderId, message, warningType } = command;

    // Resolve recipient user id & email from studentId
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) throw new NotFoundException(`Student ${studentId} not found`);

    const title = `⚠️ Warning: ${warningType.replace('_', ' ')}`;

    // Persist notification to DB
    const notification = await this.prisma.notification.create({
      data: {
        recipient_id: student.id,
        sender_id: senderId,
        project_id: projectId,
        title,
        message,
        type: warningType,
      },
    });

    // Push real-time via SSE
    this.sseService.emit(student.id, {
      type: 'WARNING',
      data: {
        notificationId: notification.id,
        title,
        message,
        warningType,
        projectId,
        createdAt: notification.created_at.toISOString(),
      },
    });

    // Send email (best-effort, non-blocking)
    void this.emailService.sendWarningEmail({
      toEmail: student.user?.email ?? '',
      studentName: student.user?.full_name ?? 'Student',
      message,
      warningType,
    });

    return { notificationId: notification.id, studentId, warningType };
  }
}
