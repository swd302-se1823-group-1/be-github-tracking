export class RemoveProjectMemberCommand {
  constructor(
    public readonly projectId: string,
    public readonly studentId: string,
    public readonly requesterId: string,
  ) {}
}
