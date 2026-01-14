import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

export const BullMQConfig = BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    connection: {
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
      password: configService.get<string>('REDIS_PASSWORD') || undefined,
    },
    defaultJobOptions: {
      attempts: 3, // Retry 3 lần
      backoff: {
        type: 'exponential', // 1s, 2s, 4s, 8s...
        delay: 2000, // Initial delay 2s
      },
      removeOnComplete: {
        age: 24 * 3600, // Keep successful jobs for 24h
        count: 1000, // Keep max 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // Keep failed jobs for 7 days
      },
    },
  }),
  inject: [ConfigService],
});
