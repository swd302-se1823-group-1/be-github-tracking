import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { LogoutCommand } from '../commands/logout.command';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  @Transactional()
  async execute(command: LogoutCommand): Promise<void> {
    const { userId, jti } = command;

    if (jti) {
      // Logout from specific session only
      await this.refreshTokenRepo.revoke(jti);
    } else {
      // Logout from all sessions
      await this.refreshTokenRepo.revokeAllForUser(userId);
    }
  }
}
