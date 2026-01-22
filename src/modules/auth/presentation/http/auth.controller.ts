import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Request, Response, CookieOptions } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from '@/modules/auth/infrastructure';
import { GoogleLoginCommand } from '@/modules/auth/application/commands/google-login.command';

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  providerId: string;
  accessToken: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  async googleAuth() {
    // Guard initiates redirect
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect to Dashboard' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as GoogleUser;
    if (!user) {
      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}/login?error=unauthorized`,
      );
    }

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

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
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax', // Tăng bảo mật cho production
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
}
