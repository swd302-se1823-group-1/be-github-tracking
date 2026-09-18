import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { SseService } from '@/modules/notification/infrastructure/sse.service';
import { BroadcastNotificationCommand } from '../commands/broadcast-notification.command';

export interface BroadcastNotificationResult {
  sentCount: number;
}

@CommandHandler(BroadcastNotificationCommand)
export class BroadcastNotificationHandler
  implements ICommandHandler<BroadcastNotificationCommand, BroadcastNotificationResult>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseService: SseService,
  ) {}

  async execute(command: BroadcastNotificationCommand): Promise<BroadcastNotificationResult> {
    const { senderId, title, message, recipientIds } = command;

    let targetIds = recipientIds;

    // If no specific recipients, broadcast to all active users
    if (!targetIds.length) {
      const users = await this.prisma.user.findMany({
        where: { is_active: true, deleted_at: null },
        select: { id: true },
      });
      targetIds = users.map((u) => u.id);
    }

    if (!targetIds.length) return { sentCount: 0 };

    // Persist all notifications in one batch
    await this.prisma.notification.createMany({
      data: targetIds.map((recipientId) => ({
        recipient_id: recipientId,
        sender_id: senderId,
        title,
        message,
        type: 'GENERAL' as const,
      })),
      skipDuplicates: true,
    });

    // Push SSE to each connected recipient
    const event = {
      type: 'BROADCAST',
      data: { title, message, createdAt: new Date().toISOString() },
    };
    targetIds.forEach((id) => this.sseService.emit(id, event));

    return { sentCount: targetIds.length };
  }
}
