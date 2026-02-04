import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GITHUB_CONFIG_KEY, GitHubConfig } from '@/config/github';

export interface GitHubProfile {
  username: string;
  email: string;
  name: string;
  avatarUrl: string;
  providerId: string;
}

@Injectable()
export class GitHubService {
  private readonly config: GitHubConfig;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<GitHubConfig>(GITHUB_CONFIG_KEY);
    if (!config) {
      throw new Error('GitHub config not found');
    }
    this.config = config;
  }

  async exchangeCodeForProfile(
    code: string,
    redirectUri?: string,
  ): Promise<GitHubProfile> {
    try {
      // Step 1: Exchange code for access token
      const tokenResponse = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            code,
            redirect_uri: redirectUri,
          }),
        },
      );

      if (!tokenResponse.ok) {
        throw new BadRequestException(
          'Failed to exchange code for access token',
        );
      }

      const tokenData = (await tokenResponse.json()) as {
        access_token?: string;
        error?: string;
        error_description?: string;
      };

      if (tokenData.error) {
        throw new BadRequestException(
          `GitHub OAuth error: ${tokenData.error_description || tokenData.error}`,
        );
      }

      if (!tokenData.access_token) {
        throw new BadRequestException('No access token received from GitHub');
      }

      const accessToken = tokenData.access_token;

      // Step 2: Get user profile
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!userResponse.ok) {
        throw new BadRequestException('Failed to fetch GitHub user profile');
      }

      const userData = (await userResponse.json()) as {
        id: number;
        login: string;
        name: string | null;
        avatar_url: string;
        email: string | null;
      };

      // Step 3: Get user emails if primary email is not public
      let email = userData.email;
      if (!email) {
        const emailsResponse = await fetch(
          'https://api.github.com/user/emails',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        );

        if (emailsResponse.ok) {
          const emails = (await emailsResponse.json()) as Array<{
            email: string;
            primary: boolean;
            verified: boolean;
          }>;
          const primaryEmail = emails.find((e) => e.primary && e.verified);
          email = primaryEmail?.email || emails[0]?.email || null;
        }
      }

      if (!email) {
        throw new BadRequestException(
          'No verified email found in GitHub account. Please make sure your GitHub account has a verified email.',
        );
      }

      return {
        username: userData.login,
        email,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        providerId: userData.id.toString(),
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('GitHub authentication failed:', error);
      throw new BadRequestException(
        `GitHub authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
