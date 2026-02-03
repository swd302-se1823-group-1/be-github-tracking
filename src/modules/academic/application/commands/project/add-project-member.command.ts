export class AddProjectMemberCommand {
  constructor(
    public readonly projectId: string,
    public readonly studentId: string,
    public readonly role: string, // 'LEADER' | 'MEMBER'
    public readonly userId: string, // Who is performing the action (for audit/auth)
  ) {}
}
