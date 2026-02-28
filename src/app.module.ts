import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule, ThrottlerConfig } from '@/config';
import { InfrastructureModule } from '@/infrastructure';
import { SharedModule } from '@/shared';
import { AuthModule } from '@/modules/auth/auth.module';
import { IdentityModule } from '@/modules/identity/identity.module';
import { RolesGuard } from '@/modules/auth/infrastructure/guards/roles.guard';
import { JwtAccessGuard } from '@/modules/auth/infrastructure';
import { AcademicModule } from './modules/academic/academic.module';
import { TrackingModule } from './modules/tracking/tracking.module';

@Module({
  imports: [
    AppConfigModule,
    ThrottlerConfig,
    InfrastructureModule,
    SharedModule,
    AuthModule,
    IdentityModule,
    AcademicModule,
    TrackingModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          imports: [InfrastructureModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: JwtAccessGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
