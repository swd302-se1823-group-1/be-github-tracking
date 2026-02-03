export class CreateProjectCommand {
  constructor(
    public readonly classId: string,
    public readonly name: string,
    public readonly topic: string,
    public readonly description: string | null,
    public readonly avatarUrl: string | null,
    public readonly userId: string,
  ) {}
}
