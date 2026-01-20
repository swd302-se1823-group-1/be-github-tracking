import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule, ThrottlerConfig } from '@/config';
import { InfrastructureModule } from '@/infrastructure';
import { SharedModule } from '@/shared';

@Module({
  imports: [
    AppConfigModule,
    ThrottlerConfig,
    InfrastructureModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
