import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { GOOGLE_CONFIG_KEY, GoogleConfig } from '@/config/google';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const googleConfig = configService.get<GoogleConfig>(GOOGLE_CONFIG_KEY)!;

    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): any {
    const { name, emails, photos, id } = profile;

    const user = {
      email: emails && emails[0] ? emails[0].value : null,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos && photos[0] ? photos[0].value : null,
      providerId: id,
      accessToken,
    };

    done(null, user);
  }
}
