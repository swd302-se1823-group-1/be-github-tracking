import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { SyncRepositoryCommand } from '../../commands/github/sync-repository.command';

@CommandHandler(SyncRepositoryCommand)
export class SyncRepositoryHandler implements ICommandHandler<
  SyncRepositoryCommand,
  void
> {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('sync-github-commits')
    private readonly syncQueue: Queue,
  ) {}

  async execute(command: SyncRepositoryCommand): Promise<void> {
    const { repositoryId } = command;

    const repo = await this.prisma.repository.findUnique({
      where: { id: repositoryId },
      include: {
        project: true,
      },
    });

    if (!repo) {
      throw new NotFoundException(
        `Repository with ID ${repositoryId} not found`,
      );
    }

    await this.syncQueue.add(
      'sync-github-commits',
      {
        repositoryId: repo.id,
        projectId: repo.project_id,
        owner: repo.owner,
        name: repo.name,
      },
      {
        jobId: `manual-sync-${repo.id}-${Date.now()}`,
        removeOnComplete: true,
      },
    );
  }
}
