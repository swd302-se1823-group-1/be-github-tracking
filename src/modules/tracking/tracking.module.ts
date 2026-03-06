import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure';
import { AuthModule } from '@/modules/auth/auth.module';
import { GitHubController } from './presentation/http/github.controller';
import { VerifyGitHubAccountHandler } from './application/handlers/github/verify-github-account.handler';
import { GetGitHubMappingHandler } from './application/handlers/github/get-github-mapping.handler';
import { SyncRepositoryHandler } from './application/handlers/github/sync-repository.handler';
import { GetStudentStatsHandler } from './application/handlers/github/get-student-stats.handler';
import { IGithubMappingRepository } from './domain/repositories/github-mapping.repository';
import { PrismaGithubMappingRepository } from './infrastructure/repositories/prisma-github-mapping.repository';
import { GitHubService } from './application/services/github.service';

import { BullModule } from '@nestjs/bullmq';
import { SyncCommitsProducer } from './application/jobs/sync-commits.producer';
import { SyncCommitsConsumer } from './application/jobs/sync-commits.consumer';

const Handlers = [
  VerifyGitHubAccountHandler,
  GetGitHubMappingHandler,
  SyncRepositoryHandler,
  GetStudentStatsHandler,
];

@Module({
  imports: [
    CqrsModule,
    InfrastructureModule,
    forwardRef(() => AuthModule),
    BullModule.registerQueue({
      name: 'sync-github-commits',
    }),
  ],
  controllers: [GitHubController],
  providers: [
    ...Handlers,
    {
      provide: IGithubMappingRepository,
      useClass: PrismaGithubMappingRepository,
    },
    GitHubService,
    SyncCommitsProducer,
    SyncCommitsConsumer,
  ],
  exports: [IGithubMappingRepository, GitHubService],
})
export class TrackingModule {}
