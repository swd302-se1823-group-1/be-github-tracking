import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
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
