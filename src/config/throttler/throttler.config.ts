import { ThrottlerModule } from '@nestjs/throttler';

export const ThrottlerConfig = ThrottlerModule.forRoot({
  errorMessage: 'Too many requests. Please try again later.',
  throttlers: [
    {
      name: 'default',
      ttl: 1_000,
      limit: 100,
    },
    {
      // Strict: login/OAuth endpoints (5 req / 60s)
      name: 'auth',
      ttl: 60_000,
      limit: 5,
    },
    {
      // Medium: token operations and link repo (10 req / 60s)
      name: 'medium',
      ttl: 60_000,
      limit: 10,
    },
    {
      // Sync: manual GitHub sync (5 req / 60s)
      name: 'sync',
      ttl: 60_000,
      limit: 5,
    },
  ],
});
