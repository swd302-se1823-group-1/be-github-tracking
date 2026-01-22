import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { IRefreshTokenRepository } from '@/modules/auth/domain/repositories/refresh-token.repository';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    jti: string;
    userId: string;
    deviceId: string;
    expiresAt: Date;
  }): Promise<void> {
    console.log('Creating Refresh Token with data:', {
      jti: data.jti,
      userId: data.userId,
      deviceId: data.deviceId,
      expiresAt: data.expiresAt,
    });
    await this.prisma.refreshToken.create({
      data: {
        jti: data.jti,
        user_id: data.userId,
        device_id: data.deviceId,
        expires_at: data.expiresAt,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
}
