export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly fullName: string,
    public readonly role: string, // UserRole enum as string or enum
    public readonly provider?: string,
    public readonly providerId?: string,
  ) {}
}
