export class UpdateStudentCommand {
  constructor(
    public readonly id: string,
    public readonly fullName?: string,
    public readonly studentCode?: string,
    public readonly universityEmail?: string,
  ) {}
}
