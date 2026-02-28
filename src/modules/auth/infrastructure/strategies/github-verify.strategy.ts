import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { GITHUB_CONFIG_KEY, GitHubConfig } from '@/config/github';

@Injectable()
export class GitHubVerifyStrategy extends PassportStrategy(
  Strategy,
  'github-verify',
) {
  constructor(private readonly configService: ConfigService) {
    const githubConfig = configService.get<GitHubConfig>(GITHUB_CONFIG_KEY)!;

    super({
      clientID: githubConfig.clientId,
      clientSecret: githubConfig.clientSecret,
      callbackURL: githubConfig.callbackUrl,
      scope: ['user:email', 'read:user', 'repo'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user?: any, info?: any) => void,
  ): any {
    const { username, emails, photos, id, displayName } = profile;

    const user = {
      username,
      email: emails && emails[0] ? emails[0].value : null,
      name: displayName || username,
      avatarUrl: photos && photos[0] ? photos[0].value : null,
      providerId: id,
      accessToken,
    };

    done(null, user);
  }
}
