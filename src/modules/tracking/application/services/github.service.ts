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

export interface GitHubCommitInfo {
  hash: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorUsername: string | null;
  date: Date;
  additions: number;
  deletions: number;
  changedFiles: number;
}

interface GitHubGraphQLResponse {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
          edges: Array<{
            node: {
              oid: string;
              message: string;
              additions: number;
              deletions: number;
              changedFilesIfAvailable: number;
              authoredDate: string;
              author: {
                name: string;
                email: string;
                user: {
                  login: string;
                } | null;
              };
            };
          }>;
        };
      };
    } | null;
  } | null;
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

  /**
   * Fetch repository commits with stats using GraphQL.
   */
  async getCommitsWithStats(
    owner: string,
    repo: string,
    sinceTimestamp: Date | null,
    token: string,
  ): Promise<GitHubCommitInfo[]> {
    try {
      const octokit = new Octokit({ auth: token });

      const query = `
        query getCommits($owner: String!, $name: String!, $since: GitTimestamp, $cursor: String) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 100, since: $since, after: $cursor) {
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                    edges {
                      node {
                        oid
                        message
                        additions
                        deletions
                        changedFilesIfAvailable
                        authoredDate
                        author {
                          name
                          email
                          user {
                            login
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      let hasNextPage = true;
      let cursor: string | null = null;
      const allCommits: GitHubCommitInfo[] = [];

      while (hasNextPage) {
        const variables: Record<string, any> = {
          owner,
          name: repo,
          cursor,
        };
        if (sinceTimestamp) {
          variables.since = sinceTimestamp.toISOString();
        }

        console.log(
          `[GitHubService] Querying ${owner}/${repo} with variables:`,
          JSON.stringify(variables, null, 2),
        );

        const data = await octokit.graphql<GitHubGraphQLResponse>(
          query,
          variables,
        );

        if (!data.repository) {
          throw new NotFoundException(
            `Repository '${owner}/${repo}' not found or inaccessible with current token.`,
          );
        }

        const history = data.repository.defaultBranchRef?.target?.history;
        if (!history) {
          console.warn(`[GitHubService] No history found for ${owner}/${repo}`);
          break;
        }

        console.log(
          `[GitHubService] History found. Edges count: ${history.edges?.length || 0}`,
        );

        for (const edge of history.edges) {
          const node = edge.node;
          allCommits.push({
            hash: node.oid,
            message: node.message,
            authorName: node.author.name || 'Unknown',
            authorEmail: node.author.email || 'Unknown',
            authorUsername: node.author.user?.login || null,
            date: new Date(node.authoredDate),
            additions: node.additions || 0,
            deletions: node.deletions || 0,
            changedFiles: node.changedFilesIfAvailable || 0,
          });
        }

        hasNextPage = history.pageInfo.hasNextPage;
        cursor = history.pageInfo.endCursor;
      }

      return allCommits;
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
        `Failed to fetch commits from GitHub: ${message}`,
      );
    }
  }
}
