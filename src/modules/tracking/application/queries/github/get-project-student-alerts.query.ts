export class GetProjectStudentAlertsQuery {
  constructor(
    public readonly projectId: string,
    public readonly inactiveDays: number = 5,
  ) {}
}
