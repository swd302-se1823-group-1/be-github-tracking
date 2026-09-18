import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure';
import { AuthModule } from '@/modules/auth/auth.module';
import { GitHubController } from './presentation/http/github.controller';
import { VerifyGitHubAccountHandler } from './application/handlers/github/verify-github-account.handler';
import { GetGitHubMappingHandler } from './application/handlers/github/get-github-mapping.handler';
import { SyncRepositoryHandler } from './application/handlers/github/sync-repository.handler';
import { GetStudentStatsHandler } from './application/handlers/github/get-student-stats.handler';
import { GetProjectStudentsStatsHandler } from './application/handlers/github/get-project-students-stats.handler';
import { GetLecturerClassesStatsHandler } from './application/handlers/github/get-lecturer-classes-stats.handler';
import { GetLecturerDashboardStatsHandler } from './application/handlers/github/get-lecturer-dashboard-stats.handler';
import { GetAdminDashboardStatsHandler } from './application/handlers/github/get-admin-dashboard-stats.handler';
import { GetLecturerStatisticsHandler } from './application/handlers/github/get-lecturer-statistics.handler';
import { GetProjectCommitTimelineHandler } from './application/handlers/github/get-project-commit-timeline.handler';
import { IGithubMappingRepository } from './domain/repositories/github-mapping.repository';
import { PrismaGithubMappingRepository } from './infrastructure/repositories/prisma-github-mapping.repository';
import { GitHubService } from './application/services/github.service';

import { BullModule } from '@nestjs/bullmq';
import { SyncCommitsProducer } from './application/jobs/sync-commits.producer';
import { SyncCommitsConsumer } from './application/jobs/sync-commits.consumer';

import { GetProjectSummaryStatsHandler } from './application/handlers/github/get-project-summary-stats.handler';
import { GetProjectStudentAlertsHandler } from './application/handlers/github/get-project-student-alerts.handler';
import { GetProjectRankingHandler } from './application/handlers/github/get-project-ranking.handler';

const QueryHandlers = [
  GetProjectStudentsStatsHandler,
  GetLecturerClassesStatsHandler,
  GetLecturerDashboardStatsHandler,
  GetAdminDashboardStatsHandler,
  GetLecturerStatisticsHandler,
  GetProjectCommitTimelineHandler,
  GetProjectSummaryStatsHandler,
  GetProjectStudentAlertsHandler,
  GetProjectRankingHandler,
];

const Handlers = [
  VerifyGitHubAccountHandler,
  GetGitHubMappingHandler,
  SyncRepositoryHandler,
  GetStudentStatsHandler, // Retained from original QueryHandlers as it was not in the new QueryHandlers or Handlers
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
    ...QueryHandlers,
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
