import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWT_CONFIG_KEY, jwtConfig, JwtConfig } from '@/config/jwt';

import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './presentation/http/auth.controller';
import { GoogleLoginHandler } from './application/handlers/google-login.handler';
import { RefreshTokenHandler } from './application/handlers/refresh-token.handler';
import { LogoutHandler } from './application/handlers/logout.handler';
// Strategies
import {
  JwtAccessStrategy,
  JwtRefreshStrategy,
  GoogleStrategy,
  GitHubVerifyStrategy,
} from './infrastructure/strategies';

// Guards
import {
  JwtAccessGuard,
  JwtRefreshGuard,
  GoogleAuthGuard,
  GitHubVerifyGuard,
} from './infrastructure/guards';

import { TokenService } from './application/services/token.service';

import { InfrastructureModule } from '@/infrastructure';
import { googleConfig, githubConfig } from '@/config';
import { IRefreshTokenRepository } from '@/modules/auth/domain/repositories/refresh-token.repository';
import { PrismaRefreshTokenRepository } from '@/modules/auth/infrastructure/repositories/refresh-token.repository';
import { RolesGuard } from '@/modules/auth/infrastructure/guards/roles.guard';
import { IdentityModule } from '@/modules/identity/identity.module';
import { GoogleService } from '@/modules/auth/infrastructure/services/google.service';
import { GitHubService } from '@/modules/auth/infrastructure/services/github.service';

@Module({
  controllers: [AuthController],
  imports: [
    InfrastructureModule,
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt-access' }),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(googleConfig),
    ConfigModule.forFeature(githubConfig),
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
    forwardRef(() => IdentityModule), // IdentityModule exports IUserRepository
  ],
  providers: [
    // Services
    TokenService,
    GoogleService,
    GitHubService,
    // Repositories
    {
      provide: IRefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository,
    },
    // Strategies
    JwtAccessStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    GitHubVerifyStrategy,
    // Guards
    JwtAccessGuard,
    JwtRefreshGuard,
    GoogleAuthGuard,
    GitHubVerifyGuard,
    // Handlers
    GoogleLoginHandler,
    RefreshTokenHandler,
    LogoutHandler,
    RolesGuard,
  ],
  exports: [
    JwtModule,
    PassportModule,
    TokenService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtAccessGuard,
    JwtRefreshGuard,
    GoogleAuthGuard,
    GitHubVerifyGuard,
    GoogleStrategy,
    GitHubVerifyStrategy,
    RolesGuard,
    GitHubService,
  ],
})
export class AuthModule {}
