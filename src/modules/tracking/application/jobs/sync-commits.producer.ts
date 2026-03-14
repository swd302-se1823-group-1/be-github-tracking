import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

@Injectable()
export class SyncCommitsProducer implements OnModuleInit {
  private readonly logger = new Logger(SyncCommitsProducer.name);

  constructor(
    @InjectQueue('sync-github-commits') private readonly syncQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing repeatable sync jobs...');
    try {
      // Remove any existing repeatable jobs to avoid duplicates on restart
      const repeatableJobs = await this.syncQueue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        await this.syncQueue.removeRepeatableByKey(job.key);
      }

      const repositories = await this.prisma.repository.findMany({
        where: { deleted_at: null },
      });

      for (const repo of repositories) {
        await this.syncQueue.add(
          'sync-commits-job',
          {
            repositoryId: repo.id,
            projectId: repo.project_id,
            owner: repo.owner,
            name: repo.name,
          },
          {
            repeat: {
              pattern: '0 0 */2 * *', // Every 2 days
            },
            jobId: `sync-${repo.id}`, // Constant ID to prevent duplication
            removeOnComplete: true, // Auto-clean Redis
            removeOnFail: 100, // Keep last 100 failures
          },
        );
      }
      this.logger.log(`Initialized ${repositories.length} repeatable jobs.`);
    } catch (error) {
      this.logger.error('Failed to initialize repeatable jobs', error);
    }
  }
}
