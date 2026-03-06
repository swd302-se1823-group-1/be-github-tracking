import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GitHubService, GitHubCommitInfo } from '../services/github.service';
import { IGithubMappingRepository } from '../../domain/repositories/github-mapping.repository';

@Processor('sync-github-commits')
export class SyncCommitsConsumer extends WorkerHost {
  private readonly logger = new Logger(SyncCommitsConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly githubService: GitHubService,
    @Inject(IGithubMappingRepository)
    private readonly githubMappingRepository: IGithubMappingRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      const { repositoryId, projectId, owner, name } = job.data as {
        repositoryId: string;
        projectId: string;
        owner: string;
        name: string;
      };
      this.logger.log(`Processing sync for repository: ${owner}/${name}`);

      // Create a sync log entry
      const syncLog = await this.prisma.syncLog.create({
        data: {
          repository_id: repositoryId,
          trigger_type: 'CRON',
          started_at: new Date(),
          status: 'RUNNING',
        },
      });

      try {
        const startTime = Date.now();

        // Find all project members and their github mappings
        const projectMembers = await this.prisma.projectMember.findMany({
          where: { project_id: projectId },
        });

        // Create a list of all unique verified tokens and mapping info
        const verifiedTokens: string[] = [];
        const usernameToMemberIdMap = new Map<string, string>();
        const emailToMemberIdMap = new Map<string, string>();

        for (const member of projectMembers) {
          const mapping = await this.githubMappingRepository.findByStudentId(
            member.student_id,
          );
          if (mapping && mapping.isVerified) {
            if (
              mapping.accessToken &&
              !verifiedTokens.includes(mapping.accessToken)
            ) {
              verifiedTokens.push(mapping.accessToken);
            }
            if (mapping.githubUsername) {
              usernameToMemberIdMap.set(
                mapping.githubUsername.toLowerCase(),
                member.id,
              );
            }
            if (mapping.githubEmail) {
              emailToMemberIdMap.set(
                mapping.githubEmail.toLowerCase(),
                member.id,
              );
            }
          }
        }

        if (verifiedTokens.length === 0) {
          this.logger.warn(
            `No verified GitHub tokens found for project ${projectId}`,
          );
          await this.prisma.syncLog.update({
            where: { id: syncLog.id },
            data: {
              status: 'FAILED',
              completed_at: new Date(),
              log_message:
                'No verified GitHub token available among project members',
            },
          });
          return;
        }

        // Read repository's last_scanned_at to determine the sync starting point
        const repo = await this.prisma.repository.findUnique({
          where: { id: repositoryId },
        });

        const sinceTimestamp = repo?.last_scanned_at || null;

        this.logger.log(
          `[SyncCommitsConsumer] Syncing ${owner}/${name} since: ${sinceTimestamp ? sinceTimestamp.toISOString() : 'beginning (all history)'}`,
        );

        let commits: GitHubCommitInfo[] = [];
        let successToken: string | null = null;

        // Try tokens one by one until one works
        for (const currentToken of verifiedTokens) {
          try {
            commits = await this.githubService.getCommitsWithStats(
              owner,
              name,
              sinceTimestamp,
              currentToken,
            );
            successToken = currentToken;
            break; // Found a working token
          } catch (error) {
            this.logger.warn(
              `Token failed for ${owner}/${name}: ${error instanceof Error ? error.message : String(error)}`,
            );
            // Continue to next token
          }
        }

        if (!successToken) {
          const errorMessage = `None of the ${verifiedTokens.length} available tokens could access repository ${owner}/${name}`;
          this.logger.error(errorMessage);
          await this.prisma.syncLog.update({
            where: { id: syncLog.id },
            data: {
              status: 'FAILED',
              completed_at: new Date(),
              log_message: errorMessage,
            },
          });
          return;
        }

        this.logger.log(
          `Fetched ${commits.length} commits for ${owner}/${name}. UsernameMap: ${usernameToMemberIdMap.size}, EmailMap: ${emailToMemberIdMap.size}`,
        );

        // Log the mapping state for debugging
        if (usernameToMemberIdMap.size > 0 || emailToMemberIdMap.size > 0) {
          this.logger.log('--- CURRENT PROJECT MAPPINGS ---');
          usernameToMemberIdMap.forEach((id, user) =>
            this.logger.log(`Mapped User: ${user} -> Member: ${id}`),
          );
          emailToMemberIdMap.forEach((id, email) =>
            this.logger.log(`Mapped Email: ${email} -> Member: ${id}`),
          );
          this.logger.log('-------------------------------');
        }

        if (commits.length > 0) {
          this.logger.log('--- ALL FETCHED COMMITS FROM GITHUB ---');
          commits.forEach((c) => {
            this.logger.log(
              `[${c.hash.substring(0, 7)}] Author: ${c.authorUsername || 'N/A'}, Email: ${c.authorEmail}, Msg: ${c.message.split('\n')[0].substring(0, 50)}`,
            );
          });
          this.logger.log('---------------------------------------');
        }

        let commitsInserted = 0;
        let skippedCount = 0;

        for (const commit of commits) {
          let memberId: string | null = null;

          // Try username mapping first
          if (commit.authorUsername) {
            memberId =
              usernameToMemberIdMap.get(commit.authorUsername.toLowerCase()) ||
              null;
          }

          // Fallback to email mapping
          if (!memberId && commit.authorEmail) {
            memberId =
              emailToMemberIdMap.get(commit.authorEmail.toLowerCase()) || null;
          }

          if (!memberId) {
            this.logger.debug(
              `Skipping commit: ${commit.hash.substring(0, 7)} by ${commit.authorUsername || 'unknown'} <${commit.authorEmail}>`,
            );
            skippedCount++;
            continue;
          }

          // Upsert the commit (unique constraint: repository_id, hash)
          const existing = await this.prisma.commit.findUnique({
            where: {
              repository_id_hash: {
                repository_id: repositoryId,
                hash: commit.hash,
              },
            },
          });

          if (!existing) {
            await this.prisma.commit.create({
              data: {
                repository_id: repositoryId,
                project_member_id: memberId,
                message: commit.message,
                author_name_raw: commit.authorName,
                author_email_raw: commit.authorEmail,
                committed_date: commit.date,
                additions: commit.additions,
                deletions: commit.deletions,
                files_changed: commit.changedFiles,
                hash: commit.hash,
              },
            });
            commitsInserted++;
          }
        }

        this.logger.log(
          `Sync complete for ${owner}/${name}: ${commitsInserted} inserted, ${skippedCount} skipped.`,
        );

        // Update repo scan metadata
        await this.prisma.repository.update({
          where: { id: repositoryId },
          data: {
            last_scanned_at: new Date(),
            scan_status: 'SUCCESS',
            error_message: null,
          },
        });

        await this.prisma.syncLog.update({
          where: { id: syncLog.id },
          data: {
            status: 'SUCCESS',
            completed_at: new Date(),
            commits_found: commits.length,
            commits_inserted: commitsInserted,
            execution_time_ms: Date.now() - startTime,
          },
        });
      } catch (error: unknown) {
        this.logger.error(`Failed to process sync for ${owner}/${name}`, error);
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = String(error);
        }
        errorMessage = errorMessage.substring(0, 1000);

        await this.prisma.syncLog.update({
          where: { id: syncLog.id },
          data: {
            status: 'FAILED',
            completed_at: new Date(),
            log_message: errorMessage,
          },
        });

        // Update repo scan metadata
        await this.prisma.repository.update({
          where: { id: repositoryId },
          data: {
            scan_status: 'FAILED',
            error_message: errorMessage,
          },
        });
        throw error;
      }
    } catch (error: unknown) {
      this.logger.error('Unexpected error in sync-commits worker', error);
      throw error;
    }
  }
}
