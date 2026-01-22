import { registerAs } from '@nestjs/config';

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export const GOOGLE_CONFIG_KEY = 'google';

export default registerAs(
  GOOGLE_CONFIG_KEY,
  (): GoogleConfig => ({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3000/api/v1/auth/google/callback',
  }),
);
