export class UpdateLecturerCommand {
  constructor(
    public readonly id: string,
    public readonly editorId: string,
    public readonly fullName?: string,
    public readonly employeeCode?: string,
    public readonly degree?: string,
    public readonly department?: string,
    public readonly phoneNumber?: string,
  ) {}
}
