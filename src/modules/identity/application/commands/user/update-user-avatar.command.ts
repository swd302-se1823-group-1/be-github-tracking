import { ICommand } from '@nestjs/cqrs';

export class UpdateUserAvatarCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly avatarUrl: string,
    public readonly updatedBy: string,
  ) {}
}
