export class VerifyGitHubAccountCommand {
  constructor(
    public readonly studentId: string,
    public readonly code: string,
    public readonly redirectUri?: string,
  ) {}
}
