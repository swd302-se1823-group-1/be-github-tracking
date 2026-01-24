import { cookieConfig } from '@/config/cookie';
import { validateEnvironment } from '@/config/env';
import { googleConfig } from '@/config/google';
import { jwtConfig } from '@/config/jwt';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      load: [jwtConfig, googleConfig, cookieConfig],
      envFilePath: ['.env'],
    }),
  ],
})
export class AppConfigModule {}
