import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request, Response, CookieOptions } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import {
  GoogleAuthGuard,
  JwtRefreshGuard,
  JwtAccessGuard,
} from '@/modules/auth/infrastructure';
import { GoogleLoginCommand } from '@/modules/auth/application/commands/google-login.command';
import { GoogleLoginResult } from '@/modules/auth/application/dtos/google-login.result';
import { AuthResponseDto } from '@/modules/auth/application/dtos/auth-response.dto';
import { RefreshTokenCommand } from '@/modules/auth/application/commands/refresh-token.command';
import { RefreshTokenResult } from '@/modules/auth/application/dtos/refresh-token.result';
import { LogoutCommand } from '@/modules/auth/application/commands/logout.command';
import { GetCurrentUserQuery } from '@/modules/identity/application/queries/user/get-current-user.query';
import { CurrentUserResponseDto } from '@/modules/identity/application/dto/current-user.dto';
import { Public, ActiveUser, ResponseMessage } from '@/shared';
import { TokenResponseDto } from '@/modules/auth/application/dtos/token-response.dto';
import { GoogleProfileDto } from '@/modules/auth/application/dtos/google-profile.dto';
import { GoogleExchangeCodeDto } from '@/modules/auth/application/dtos/google-exchange-code.dto';
import { GoogleService } from '@/modules/auth/infrastructure/services/google.service';
import { CurrentUserResult } from '@/modules/identity/application/dto/current-user.result';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly configService: ConfigService,
    private readonly googleService: GoogleService,
  ) {}

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  async googleAuth() {
    // Guard initiates redirect
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect to Dashboard' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as GoogleProfileDto;
    if (!user) {
      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}/login?error=unauthorized`,
      );
    }

    // 2. Thực thi Command
    const result: { accessToken: string; refreshToken: string } =
      await this.commandBus.execute(
        new GoogleLoginCommand({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          picture: user.picture,
          providerId: user.providerId,
          accessToken: user.accessToken,
        }),
      );

    // 3. Cấu hình Cookie
    const commonCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };

    res.cookie('accessToken', result.accessToken, {
      ...commonCookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...commonCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 4. Redirect
    const state = req.query.state as string;
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    if (state && !state.startsWith('http')) {
      // Security check: ensure state is a relative path or safe URL
      res.redirect(`${frontendUrl}${state}`);
    } else {
      res.redirect(`${frontendUrl}/dashboard`);
    }
  }

  @Post('refresh')
  @Public()
  @UseGuards(JwtRefreshGuard)
  @ResponseMessage('Refresh token successfully')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'New tokens issued',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponseDto> {
    const user = req.user as { id: string; jti: string; deviceId: string };

    // Execute refresh command
    const result = await this.commandBus.execute<
      RefreshTokenCommand,
      RefreshTokenResult
    >(new RefreshTokenCommand(user.id, user.jti, user.deviceId));

    // Configure cookies
    const commonCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };

    res.cookie('accessToken', result.accessToken, {
      ...commonCookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...commonCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return new TokenResponseDto({ accessToken: result.accessToken });
  }

  @Post('google/exchange')
  @Public()
  @ApiOperation({ summary: 'Exchange Google authorization code for tokens' })
  @ApiResponse({
    status: 200,
    description: 'Tokens and user info issued',
    type: AuthResponseDto,
  })
  async exchange(
    @Body() dto: GoogleExchangeCodeDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    // 1. Exchange code for Google User Profile
    const googleUser = await this.googleService.exchangeCode(dto.code);

    // 2. Reuse GoogleLoginHandler via CommandBus
    const result = await this.commandBus.execute<
      GoogleLoginCommand,
      GoogleLoginResult
    >(new GoogleLoginCommand(googleUser));

    // 3. Configure Cookies
    const commonCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };

    res.cookie('accessToken', result.accessToken, {
      ...commonCookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...commonCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 4. Return JSON
    return new AuthResponseDto(result);
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile with role-specific data',
    type: CurrentUserResponseDto,
  })
  @ResponseMessage('User profile retrieved successfully')
  async getCurrentUser(
    @ActiveUser('id') userId: string,
  ): Promise<CurrentUserResponseDto> {
    const result = await this.queryBus.execute<
      GetCurrentUserQuery,
      CurrentUserResult
    >(new GetCurrentUserQuery(userId));

    return new CurrentUserResponseDto(result);
  }

  @Post('logout')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ResponseMessage('Logout successful')
  async logout(
    @ActiveUser('id') userId: string,
    @ActiveUser('jti') jti: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.commandBus.execute(new LogoutCommand(userId, jti));

    // Clear cookies with matching options
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
  }
}
