import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JWT_CONFIG_KEY, JwtConfig } from '@/config/jwt';
import { fromCookie } from './extractors';

export interface JwtRefreshPayload {
  sub: string; // User ID
  jti: string; // JWT ID for token lookup
  deviceId: string;
}

export interface RefreshTokenUser {
  id: string;
  jti: string;
  deviceId: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const jwtConfig = configService.get<JwtConfig>(JWT_CONFIG_KEY)!;

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromCookie('refreshToken'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.refreshSecret,
    });
  }

  validate(payload: JwtRefreshPayload): RefreshTokenUser {
    return {
      id: payload.sub,
      jti: payload.jti,
      deviceId: payload.deviceId,
    };
  }
}
