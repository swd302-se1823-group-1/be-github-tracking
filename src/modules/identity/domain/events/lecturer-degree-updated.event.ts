import { UserId } from '../value-objects/user-id.vo';

export class LecturerDegreeUpdatedEvent {
  constructor(
    public readonly userId: UserId,
    public readonly newDegree: string,
  ) {}
}
