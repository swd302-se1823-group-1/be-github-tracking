import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule, ThrottlerConfig } from '@/config';
import { InfrastructureModule } from '@/infrastructure';
import { SharedModule } from '@/shared';
import { AuthModule } from '@/modules/auth/auth.module';
import { IdentityModule } from '@/modules/identity/identity.module';
import { RolesGuard } from '@/modules/auth/infrastructure/guards/roles.guard';
import { JwtAccessGuard } from '@/modules/auth/infrastructure';

@Module({
  imports: [
    AppConfigModule,
    ThrottlerConfig,
    InfrastructureModule,
    SharedModule,
    AuthModule,
    IdentityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: JwtAccessGuard,
    },
  ],
})
export class AppModule {}
