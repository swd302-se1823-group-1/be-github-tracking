import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

@Injectable()
export class SyncCommitsProducer {
  private readonly logger = new Logger(SyncCommitsProducer.name);

  constructor(
    @InjectQueue('sync-github-commits') private readonly syncQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  @Cron('0 * * * *') // Run every hour
  async handleCron() {
    this.logger.log('Started cron job to sync GitHub commits...');
    try {
      const repositories = await this.prisma.repository.findMany({
        where: { deleted_at: null },
      });

      if (repositories.length === 0) {
        this.logger.log('No repositories found to sync.');
        return;
      }

      let enqueued = 0;
      for (const repo of repositories) {
        await this.syncQueue.add('sync-commits-job', {
          repositoryId: repo.id,
          projectId: repo.project_id,
          owner: repo.owner,
          name: repo.name,
        });
        enqueued++;
      }

      this.logger.log(`Enqueued ${enqueued} repositories for commit sync.`);
    } catch (error) {
      this.logger.error('Failed to run sync commits cron job', error);
    }
  }
}
