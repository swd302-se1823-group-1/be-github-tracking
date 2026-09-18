import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { RedisConfig } from '@/config/redis';

export const BullMQConfig = BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const redis = configService.get<RedisConfig>('redis');

    if (!redis) {
      throw new Error('Redis configuration not found');
    }

    return {
      connection: {
        host: redis.host,
        port: redis.port,
        password: redis.password,
        username: redis.username,
        tls: redis.tls ? {} : undefined,
        skipVersionCheck: true,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
        },
      },
    };
  },
  inject: [ConfigService],
});
