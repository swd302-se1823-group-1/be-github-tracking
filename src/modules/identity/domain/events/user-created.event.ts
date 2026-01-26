import { UserId } from '../value-objects/user-id.vo';
import { UserRole } from '../enums/user-role.enum';

export class UserCreatedEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: string,
    public readonly role: UserRole,
  ) {}
}
