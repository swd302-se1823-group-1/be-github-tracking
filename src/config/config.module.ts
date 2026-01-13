import { validateEnvironment } from '@/config/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      envFilePath: ['.env'],
    }),
  ],
})
export class AppConfigModule {}
