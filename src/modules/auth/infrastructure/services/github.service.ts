import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GITHUB_CONFIG_KEY, GitHubConfig } from '@/config/github';

export interface GitHubProfile {
  username: string;
  email: string;
  name: string;
  avatarUrl: string;
  providerId: string;
  accessToken: string;
}

@Injectable()
export class GitHubService {
  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<GitHubConfig>(GITHUB_CONFIG_KEY);
    if (!config) {
      throw new Error('GitHub config not found');
    }
  }
}
