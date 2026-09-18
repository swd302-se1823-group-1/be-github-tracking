import { registerAs } from '@nestjs/config';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  username?: string;
  tls: boolean;
}

export const REDIS_CONFIG_KEY = 'redis';

export default registerAs(
  REDIS_CONFIG_KEY,
  (): RedisConfig => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
    tls: process.env.REDIS_TLS === 'true',
  }),
);
