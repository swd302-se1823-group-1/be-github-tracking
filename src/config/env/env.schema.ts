import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),

  // JWT Configuration
  JWT_ACCESS_SECRET: z.string(),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
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
