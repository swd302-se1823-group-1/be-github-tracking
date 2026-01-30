import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GOOGLE_CONFIG_KEY, GoogleConfig } from '@/config/google';
import { GoogleProfileDto } from '@/modules/auth/application/dtos/google-profile.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleService {
  private client: OAuth2Client;
  private mobileClient: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const googleConfig =
      this.configService.get<GoogleConfig>(GOOGLE_CONFIG_KEY);
    if (!googleConfig) {
      throw new Error('Google config not found');
    }

    this.client = new OAuth2Client(
      googleConfig.clientId,
      googleConfig.clientSecret,
      'postmessage', // Important for flow exchange code from client
    );

    this.mobileClient = new OAuth2Client(
      googleConfig.mobileClientId,
      '', // Mobile clients usually don't have secrets
      'postmessage', // Redirect Url
    );
  }

  async exchangeCode(
    code: string,
    isMobile = false,
    redirectUri?: string,
  ): Promise<GoogleProfileDto> {
    try {
      // 1. Exchange code for tokens
      const client = isMobile ? this.mobileClient : this.client;
      const { tokens } = await client.getToken({
        code,
        redirect_uri: redirectUri,
      });

      if (!tokens.id_token) {
        throw new BadRequestException('ID Token not found in Google response');
      }

      // 2. Verify ID Token to get profile
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: [
          this.configService.get<GoogleConfig>(GOOGLE_CONFIG_KEY)!.clientId,
          this.configService.get<GoogleConfig>(GOOGLE_CONFIG_KEY)!
            .mobileClientId,
        ],
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new BadRequestException('Invalid Google ID Token payload');
      }

      return {
        email: payload.email!,
        firstName: payload.given_name!,
        lastName: payload.family_name!,
        picture: payload.picture!,
        providerId: payload.sub,
        accessToken: tokens.access_token || '', // Access token might be needed for other API calls
      };
    } catch (error: any) {
      throw new BadRequestException(`Google authentication failed: ${error}`);
    }
  }
}
