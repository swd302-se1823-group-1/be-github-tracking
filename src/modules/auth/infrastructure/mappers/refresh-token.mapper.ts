import { RefreshToken as PrismaRefreshToken } from '@generated/prisma/client';
import { RefreshToken } from '../../domain/aggregates/refresh-token.aggregate';

export class RefreshTokenMapper {
  static toDomain(prismaToken: PrismaRefreshToken): RefreshToken {
    return new RefreshToken({
      id: prismaToken.id,
      jti: prismaToken.jti,
      userId: prismaToken.user_id,
      deviceId: prismaToken.device_id,
      expiresAt: prismaToken.expires_at,
      revokedAt: prismaToken.revoked_at,
      createdAt: prismaToken.created_at,
      updatedAt: prismaToken.updated_at,
    });
  }

  static toPersistence(token: RefreshToken): PrismaRefreshToken {
    return {
      id: token.id,
      jti: token.jti,
      user_id: token.userId,
      device_id: token.deviceId,
      expires_at: token.expiresAt,
      revoked_at: token.revokedAt,
      created_at: token.createdAt,
      updated_at: token.updatedAt,
      device_name: null, // these might also be missing based on what I saw, let's check
      ip_address: null,
      user_agent: null,
    };
  }
}
