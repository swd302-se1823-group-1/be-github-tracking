import {
  Injectable,
  BadGatewayException,
  NotFoundException,
} from '@nestjs/common';

import { Octokit } from 'octokit';

export interface GitHubRepositoryInfo {
  name: string;
  owner: string;
  organization: string;
  description: string | null;
  url: string;
}

@Injectable()
export class GitHubService {
  /**
   * Fetch repository information from GitHub.
   */
  async getRepositoryData(
    owner: string,
    repo: string,
    token: string,
  ): Promise<GitHubRepositoryInfo> {
    try {
      const octokit = new Octokit({ auth: token });

      const { data } = await octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        name: data.name,
        owner: data.owner.login,
        organization: data.owner.login, // Defaulting to owner login if not an org
        description: data.description || null,
        url: data.html_url,
      };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        (error as Record<string, unknown>).status === 404
      ) {
        throw new NotFoundException(
          `GitHub repository '${owner}/${repo}' not found or is private.`,
        );
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new BadGatewayException(
        `Failed to fetch GitHub repository data: ${message}`,
      );
    }
  }
}
