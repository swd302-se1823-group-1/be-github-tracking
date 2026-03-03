import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure';
import { AuthModule } from '@/modules/auth/auth.module';
import { GitHubController } from './presentation/http/github.controller';
import { VerifyGitHubAccountHandler } from './application/handlers/github/verify-github-account.handler';
import { GetGitHubMappingHandler } from './application/handlers/github/get-github-mapping.handler';
import { IGithubMappingRepository } from './domain/repositories/github-mapping.repository';
import { PrismaGithubMappingRepository } from './infrastructure/repositories/prisma-github-mapping.repository';
import { GitHubService } from './application/services/github.service';

@Module({
  imports: [CqrsModule, InfrastructureModule, forwardRef(() => AuthModule)],
  controllers: [GitHubController],
  providers: [
    VerifyGitHubAccountHandler,
    GetGitHubMappingHandler,
    {
      provide: IGithubMappingRepository,
      useClass: PrismaGithubMappingRepository,
    },
    GitHubService,
  ],
  exports: [IGithubMappingRepository, GitHubService],
})
export class TrackingModule {}
