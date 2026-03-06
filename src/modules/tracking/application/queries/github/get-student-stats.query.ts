export class GetStudentStatsQuery {
  constructor(
    public readonly projectId: string,
    public readonly studentId: string,
  ) {}
}
