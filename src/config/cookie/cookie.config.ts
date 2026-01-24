import { registerAs } from '@nestjs/config';

export interface CookieConfig {
  domain: string;
  sameSite: boolean | 'lax' | 'strict' | 'none';
  secure: boolean;
}

export const COOKIE_CONFIG_KEY = 'cookie';

export default registerAs(
  COOKIE_CONFIG_KEY,
  (): CookieConfig => ({
    domain: process.env.COOKIE_DOMAIN as string,
    sameSite: process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none',
    secure: process.env.COOKIE_SECURE === 'true',
  }),
);
