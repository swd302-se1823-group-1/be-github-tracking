import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtConfig, JWT_CONFIG_KEY } from '@/config/jwt';
import { generateId } from '@/shared/utils/uuid';
import { UserRole } from '@generated/prisma/enums';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  jti?: string;
  deviceId?: string;
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
    deviceId?: string;
  }): Promise<AuthTokens> {
    const jwtConfig = this.configService.get<JwtConfig>(JWT_CONFIG_KEY)!;

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessOptions: JwtSignOptions = {
      secret: jwtConfig.accessSecret,

      expiresIn: jwtConfig.accessExpiresIn,
    };

    const refreshOptions: JwtSignOptions = {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    };

    const jti = generateId();
    const deviceId = user.deviceId || 'browser-' + generateId().slice(0, 8);
    const refreshPayload: TokenPayload = { ...payload, jti, deviceId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, accessOptions),
      this.jwtService.signAsync(refreshPayload, refreshOptions),
    ]);

    const refreshTokenExpiresInMs = jwtConfig.refreshExpiresIn;
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
}
