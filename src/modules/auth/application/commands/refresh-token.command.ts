import { ICommand } from '@nestjs/cqrs';
import { RefreshTokenResult } from '../dtos/refresh-token.result';

export type RefreshTokenResponse = RefreshTokenResult;

export class RefreshTokenCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly jti: string,
    public readonly deviceId: string,
  ) {}
}
