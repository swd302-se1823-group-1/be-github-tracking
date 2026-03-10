import { z } from 'zod';

export const envSchema = z.object({
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173'),
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
  COOKIE_DOMAIN: z.string(),
  COOKIE_SAMESITE: z
    .string()
    .transform((value) => value.toLowerCase() as 'lax' | 'strict' | 'none'),
  COOKIE_SECURE: z.string().transform((value) => value === 'true'),
  // JWT Configuration
  JWT_ACCESS_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  GOOGLE_MOBILE_CLIENT_ID: z.string(),

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_FOLDER: z.string().default('github-tracking/avatars'),

  // GitHub Configuration
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CALLBACK_URL: z.string().optional(),

  // Firebase Configuration
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),

  // Security Configuration
  ENCRYPTION_KEY: z
    .string()
    .length(64, 'Encryption key must be a 64-character hex string (32 bytes)'),

  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_USERNAME: z.string().optional(),
  REDIS_TLS: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(false),
});

export type Env = z.infer<typeof envSchema>;

import { ZodError } from 'zod';
import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

export const validateEnvironment = (
  config: Record<string, string>,
): Record<string, any> => {
  // ← Đổi return type
  try {
    const validated = envSchema.parse(config);
    logger.log('✅ Environment variables validated');
    return validated as Record<string, any>; // ← Cast về Record<string, any>
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map((err) => {
        const path = err.path.join('.');
        return `❌ ENV ${path}: ${err.message}`;
      });

      const errorMessage = [
        '🚨 Environment validation failed!',
        '',
        ...formattedErrors,
        '',
        '💡 Check your .env file',
      ].join('\n');

      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    throw error;
  }
};
