export class UpdateProjectCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string | null,
    public readonly topic?: string | null,
    public readonly description?: string | null,
    public readonly updatedBy?: string,
  ) {}
}
