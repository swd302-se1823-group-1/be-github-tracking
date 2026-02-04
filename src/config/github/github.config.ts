import { registerAs } from '@nestjs/config';

export interface GitHubConfig {
  clientId: string;
  clientSecret: string;
}

export const GITHUB_CONFIG_KEY = 'github';

export default registerAs(
  GITHUB_CONFIG_KEY,
  (): GitHubConfig => ({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }),
);
