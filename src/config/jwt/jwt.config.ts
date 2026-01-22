import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

export const JWT_CONFIG_KEY = 'jwt';

export default registerAs(
  JWT_CONFIG_KEY,
  (): JwtConfig => ({
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN as string),
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN as string),
  }),
);
