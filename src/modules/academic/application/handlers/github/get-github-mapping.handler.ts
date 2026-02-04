import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetGitHubMappingQuery } from '@/modules/academic/application/queries/github/get-github-mapping.query';
import { IGithubMappingRepository } from '@/modules/academic/domain/repositories/github-mapping.repository';
import { GithubMappingAggregate } from '@/modules/academic/domain/aggregates/github-mapping.aggregate';

@QueryHandler(GetGitHubMappingQuery)
export class GetGitHubMappingHandler implements IQueryHandler<
  GetGitHubMappingQuery,
  GithubMappingAggregate | null
> {
  constructor(
    private readonly githubMappingRepository: IGithubMappingRepository,
  ) {}

  async execute(
    query: GetGitHubMappingQuery,
  ): Promise<GithubMappingAggregate | null> {
    return this.githubMappingRepository.findByStudentId(query.studentId);
  }
}
