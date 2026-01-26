import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { TokenService } from '../services/token.service';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { FindUserByIdQuery } from '@/modules/identity/application/queries/find-user-by-id.query';
import { UserAggregate } from '@/modules/identity/domain/aggregates/user.aggregate';
import { RefreshToken } from '../../domain/aggregates/refresh-token.aggregate';
import { generateId } from '@/shared/utils/uuid';

import { RefreshTokenResult } from '@/modules/auth/application/dtos/refresh-token.result';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<
  RefreshTokenCommand,
  RefreshTokenResult
> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly tokenService: TokenService,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  @Transactional()
  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const { userId, jti, deviceId } = command;

    // 1. Validate refresh token exists in DB and not revoked
    const storedToken = await this.refreshTokenRepo.findByJti(jti);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    storedToken.validate(userId);

    // 2. Get user details via QueryBus (respecting DDD bounded context)
    const user = await this.queryBus.execute<
      FindUserByIdQuery,
      UserAggregate | null
    >(new FindUserByIdQuery(userId));

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // 3. Revoke old refresh token
    storedToken.revoke();
    await this.refreshTokenRepo.save(storedToken);

    // 4. Generate new token pair
    const tokens = await this.tokenService.generateAuthTokens({
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    });

    // 5. Store new refresh token
    const newRefreshToken = new RefreshToken({
      id: generateId(),
      jti: tokens.jti,
      userId: user.id.toString(),
      deviceId: deviceId,
      expiresAt: tokens.refreshTokenExpiresAt,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.refreshTokenRepo.create(newRefreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
