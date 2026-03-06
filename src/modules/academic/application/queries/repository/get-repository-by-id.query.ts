export class GetRepositoryByIdQuery {
  constructor(
    public readonly repositoryId: string,
    public readonly projectId: string,
    public readonly userId: string,
  ) {}
}
