import { GitHubProfile } from '@/modules/tracking/domain/types/github-profile.type';

export class VerifyGitHubAccountCommand {
  constructor(
    public readonly studentId: string,
    public readonly githubProfile: GitHubProfile,
  ) {}
}
