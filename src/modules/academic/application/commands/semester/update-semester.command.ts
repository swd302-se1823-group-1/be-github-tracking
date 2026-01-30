export class UpdateSemesterCommand {
  constructor(
    public readonly id: string,
    public readonly code?: string,
    public readonly name?: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
    public readonly isActive?: boolean,
    public readonly updatedBy?: string,
  ) {}
}
