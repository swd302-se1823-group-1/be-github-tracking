import { PrismaModule } from './database';
import { Module } from '@nestjs/common';
import { CryptoModule } from './security/crypto.module';
import { BullMQConfig } from '@/infrastructure/queue/bull-mq.config';

@Module({
  imports: [PrismaModule, CryptoModule, BullMQConfig],
  exports: [PrismaModule, CryptoModule, BullMQConfig],
})
export class InfrastructureModule {}
