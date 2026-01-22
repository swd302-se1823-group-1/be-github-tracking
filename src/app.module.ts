import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule, ThrottlerConfig } from '@/config';
import { InfrastructureModule } from '@/infrastructure';
import { SharedModule } from '@/shared';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [
    AppConfigModule,
    ThrottlerConfig,
    InfrastructureModule,
    SharedModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
