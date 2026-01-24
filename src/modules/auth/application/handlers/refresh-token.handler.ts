import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { TokenService } from '../services/token.service';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { RefreshToken } from '../../domain/aggregates/refresh-token.aggregate';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    @Inject(IUserRepository)
    private readonly userRepo: IUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { userId, jti, deviceId } = command;

    // Use Prisma transaction to ensure atomicity
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validate refresh token exists in DB and not revoked
      const storedToken = await tx.refreshToken.findUnique({
        where: { jti },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshTokenAggregate = new RefreshToken({
        id: storedToken.id,
        jti: storedToken.jti,
        userId: storedToken.user_id,
        deviceId: storedToken.device_id,
        expiresAt: storedToken.expires_at,
        revokedAt: storedToken.revoked_at,
        createdAt: storedToken.created_at,
        updatedAt: storedToken.updated_at,
      });

      refreshTokenAggregate.validate(userId);

      // 2. Get user details
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.is_active) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // 3. Revoke old refresh token (UPDATE in transaction)
      refreshTokenAggregate.revoke();

      await tx.refreshToken.update({
        where: { jti },
        data: {
          revoked_at: refreshTokenAggregate.revokedAt,
          updated_at: refreshTokenAggregate.updatedAt,
        },
      });

      // 4. Generate new token pair
      const tokens = await this.tokenService.generateAuthTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // 5. Store new refresh token (INSERT in transaction)
      await tx.refreshToken.create({
        data: {
          jti: tokens.jti,
          user_id: user.id,
          device_id: deviceId,
          expires_at: tokens.refreshTokenExpiresAt,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    });
  }
}
