import { cookieConfig } from '@/config/cookie';
import { validateEnvironment } from '@/config/env';
import { githubConfig } from '@/config/github';
import { googleConfig } from '@/config/google';
import { jwtConfig } from '@/config/jwt';
import { firebaseConfig } from '@/config/firebase';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      load: [
        jwtConfig,
        googleConfig,
        cookieConfig,
        githubConfig,
        firebaseConfig,
      ],
      envFilePath: ['.env'],
    }),
  ],
})
export class AppConfigModule {}
