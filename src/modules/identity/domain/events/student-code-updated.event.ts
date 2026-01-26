import { UserId } from '../value-objects/user-id.vo';

export class StudentCodeUpdatedEvent {
  constructor(
    public readonly userId: UserId,
    public readonly newCode: string,
  ) {}
}
