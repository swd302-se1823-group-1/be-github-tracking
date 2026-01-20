import { ThrottlerModule } from '@nestjs/throttler';

export const ThrottlerConfig = ThrottlerModule.forRoot({
  errorMessage: 'Too many requests. Please try again later.',
  throttlers: [
    {
      name: 'default',
      ttl: 10_000,
      limit: 20,
    },
  ],
});
