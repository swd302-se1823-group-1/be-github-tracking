import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWT_CONFIG_KEY, JwtConfig } from '@/config/jwt';

// Strategies
import {
  JwtAccessStrategy,
  JwtRefreshStrategy,
} from './infrastructure/strategies';

// Guards
import { JwtAccessGuard, JwtRefreshGuard } from './infrastructure/guards';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt-access' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const jwtConfig = configService.get<JwtConfig>(JWT_CONFIG_KEY)!;
        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.accessExpiresIn,
          },
        } as JwtModuleOptions;
      },
    }),
  ],
  providers: [
    // Strategies
    JwtAccessStrategy,
    JwtRefreshStrategy,
    // Guards
    JwtAccessGuard,
    JwtRefreshGuard,
  ],
  exports: [
    JwtModule,
    PassportModule,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtAccessGuard,
    JwtRefreshGuard,
  ],
})
export class AuthModule {}
