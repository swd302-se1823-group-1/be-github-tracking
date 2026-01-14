import { PrismaModule } from './database';
import { RedisModule } from './redis';
import { Module } from '@nestjs/common';
import { CryptoModule } from './security/crypto.module';
import { KafkaModule } from '@/infrastructure/kafka/kafka.module';
import { BullMQConfig } from '@/infrastructure/queue/bull-mq.config';

@Module({
  imports: [PrismaModule, RedisModule, CryptoModule, KafkaModule, BullMQConfig],
  exports: [PrismaModule, RedisModule, CryptoModule, KafkaModule, BullMQConfig],
})
export class InfrastructureModule {}
