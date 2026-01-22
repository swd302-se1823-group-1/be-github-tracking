import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtConfig, JWT_CONFIG_KEY } from '@/config/jwt';
import { generateId } from '@/shared/utils/uuid';
import { UserRole } from '@/generated/prisma/enums';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  jti?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  jti: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAuthTokens(user: {
    id: string;
    email: string;
    role: UserRole;
  }): Promise<AuthTokens> {
    const jwtConfig = this.configService.get<JwtConfig>(JWT_CONFIG_KEY)!;

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessOptions: JwtSignOptions = {
      secret: jwtConfig.accessSecret,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expiresIn: jwtConfig.accessExpiresIn as any,
    };

    const refreshOptions: JwtSignOptions = {
      secret: jwtConfig.refreshSecret,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expiresIn: jwtConfig.refreshExpiresIn as any,
    };

    const accessToken = await this.jwtService.signAsync(payload, accessOptions);

    const jti = generateId();
    const refreshPayload: TokenPayload = { ...payload, jti };

    const refreshToken = await this.jwtService.signAsync(
      refreshPayload,
      refreshOptions,
    );

    const refreshTokenExpiresInMs = this.parseDuration(
      jwtConfig.refreshExpiresIn,
    );
    const refreshTokenExpiresAt = new Date(
      Date.now() + refreshTokenExpiresInMs,
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      jti,
    };
  }

  private parseDuration(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return parseInt(duration, 10); // Check if it's already ms
    }
  }
}
