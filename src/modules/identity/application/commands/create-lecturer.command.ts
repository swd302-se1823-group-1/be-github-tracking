export class CreateLecturerCommand {
  constructor(
    public readonly email: string,
    public readonly fullName: string,
    public readonly employeeCode: string,
    public readonly degree: string,
    public readonly department?: string,
    public readonly phoneNumber?: string,
    public readonly createdBy?: string,
  ) {}
}
