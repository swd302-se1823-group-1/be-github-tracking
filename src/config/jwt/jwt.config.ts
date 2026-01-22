import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export const JWT_CONFIG_KEY = 'jwt';

export default registerAs(
  JWT_CONFIG_KEY,
  (): JwtConfig => ({
    accessSecret: process.env.JWT_ACCESS_SECRET || 'helo',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'helo',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  }),
);
