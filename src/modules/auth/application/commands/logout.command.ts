import { ICommand } from '@nestjs/cqrs';

export class LogoutCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly jti?: string, // Optional: if provided, logout only this session
  ) {}
}
