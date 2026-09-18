export class UpdateClassCommand {
  constructor(
    public readonly id: string,
    public readonly className?: string,
    public readonly description?: string,
    public readonly enrollPassword?: string,
    public readonly lecturerId?: string,
    public readonly updatedBy?: string,
  ) {}
}
