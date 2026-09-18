import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo';

export class LecturerDegreeUpdatedEvent {
  constructor(
    public readonly userId: UserId,
    public readonly newDegree: string,
  ) {}
}
