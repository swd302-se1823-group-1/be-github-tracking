export class UpdateProjectAvatarCommand {
  constructor(
    public readonly projectId: string,
    public readonly avatarUrl: string,
    public readonly updatedBy: string,
  ) {}
}
