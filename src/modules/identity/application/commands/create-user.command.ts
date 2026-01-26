import { ICommand } from '@nestjs/cqrs';
import { UserRole } from '../../domain/enums/user-role.enum';

export class CreateUserCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly fullName: string,
    public readonly provider: string,
    public readonly providerId: string,
    public readonly avatarUrl?: string,
    public readonly role?: UserRole,
    public readonly createdBy?: string,
  ) {}
}
