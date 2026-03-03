export class LinkRepositoryCommand {
  constructor(
    public readonly projectId: string,
    public readonly url: string,
    public readonly currentUserId: string,
  ) {}
}
