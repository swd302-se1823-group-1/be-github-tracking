import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

export class UserCreatedEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: string,
    public readonly role: UserRole,
  ) {}
}
