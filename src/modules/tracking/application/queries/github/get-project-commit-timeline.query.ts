export class GetProjectCommitTimelineQuery {
  constructor(
    public readonly projectId: string,
    public readonly days: number = 30,
  ) {}
}
