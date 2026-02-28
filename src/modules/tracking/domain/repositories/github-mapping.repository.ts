import { GithubMappingAggregate } from '../aggregates/github-mapping.aggregate';

export abstract class IGithubMappingRepository {
  abstract findByStudentId(
    studentId: string,
  ): Promise<GithubMappingAggregate | null>;

  abstract findByGitHubEmail(
    email: string,
  ): Promise<GithubMappingAggregate | null>;

  abstract findByGitHubUsername(
    username: string,
  ): Promise<GithubMappingAggregate | null>;

  abstract findByGitHubId(
    githubId: string,
  ): Promise<GithubMappingAggregate | null>;

  abstract save(
    mapping: GithubMappingAggregate,
  ): Promise<GithubMappingAggregate>;

  abstract delete(id: string): Promise<void>;
}
