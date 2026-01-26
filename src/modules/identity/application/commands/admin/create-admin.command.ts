export class CreateAdminCommand {
  constructor(
    public readonly email: string,
    public readonly fullName: string,
    public readonly avatarUrl?: string,
    public readonly createdBy?: string,
  ) {}
}
