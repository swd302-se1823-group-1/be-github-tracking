import { GitHubProfile } from '@/modules/auth/infrastructure/services/github.service';

export class VerifyGitHubAccountCommand {
  constructor(
    public readonly studentId: string,
    public readonly githubProfile: GitHubProfile,
  ) {}
}
