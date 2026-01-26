import { ICommand } from '@nestjs/cqrs';

export class UpdateUserGoogleInfoCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly providerId: string,
    public readonly avatarUrl?: string,
  ) {}
}
