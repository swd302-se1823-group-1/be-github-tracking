import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWT_CONFIG_KEY, jwtConfig, JwtConfig } from '@/config/jwt';

import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './presentation/http/auth.controller';
import { GoogleLoginHandler } from './application/handlers/google-login.handler';
// Strategies
import {
  JwtAccessStrategy,
  JwtRefreshStrategy,
  GoogleStrategy,
} from './infrastructure/strategies';

// Guards
import {
  JwtAccessGuard,
  JwtRefreshGuard,
  GoogleAuthGuard,
} from './infrastructure/guards';

import { TokenService } from './application/services/token.service';
import { IUserRepository } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import {
  IRefreshTokenRepository,
  PrismaRefreshTokenRepository,
} from './infrastructure/repositories/refresh-token.repository';

import { InfrastructureModule } from '@/infrastructure';
import { googleConfig } from '@/config';

@Module({
  controllers: [AuthController],
  imports: [
    InfrastructureModule,
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt-access' }),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(googleConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const jwtConfig = configService.get<JwtConfig>(JWT_CONFIG_KEY)!;
        return {
          secret: jwtConfig.accessSecret,
          signOptions: {
            expiresIn: jwtConfig.accessExpiresIn,
          },
        } as JwtModuleOptions;
      },
    }),
  ],
  providers: [
    // Services
    TokenService,
    // Repositories
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: IRefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository,
    },
    // Strategies
    JwtAccessStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    // Guards
    JwtAccessGuard,
    JwtRefreshGuard,
    GoogleAuthGuard,
    // Handlers
    GoogleLoginHandler,
  ],
  exports: [
    JwtModule,
    PassportModule,
    TokenService,
    IUserRepository,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtAccessGuard,
    JwtRefreshGuard,
    GoogleAuthGuard,
    GoogleStrategy,
  ],
})
export class AuthModule {}
