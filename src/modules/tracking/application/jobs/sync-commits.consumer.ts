import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { GitHubService, GitHubCommitInfo } from '../services/github.service';
import { IGithubMappingRepository } from '../../domain/repositories/github-mapping.repository';

interface MemberMappings {
  verifiedTokens: string[];
  githubIdToMemberIdMap: Map<string, string>;
  usernameToMemberIdMap: Map<string, string>;
  emailToMemberIdMap: Map<string, string>;
}

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

    const startTime = Date.now();

    try {
      // 1. Get member mappings and tokens
      const mappings = await this.getProjectMemberMappings(projectId);

      if (mappings.verifiedTokens.length === 0) {
        return await this.handleNoTokensFound(syncLog.id, projectId);
      }

      // 2. Determine sync starting point
      const repo = await this.prisma.repository.findUnique({
        where: { id: repositoryId },
      });
      const sinceTimestamp = repo?.last_scanned_at || null;

      this.logger.log(
        `[SyncCommitsConsumer] Syncing ${owner}/${name} since: ${sinceTimestamp ? sinceTimestamp.toISOString() : 'beginning (all history)'}`,
      );

      // 3. Fetch commits from GitHub using available tokens
      const { commits, successToken } = await this.fetchCommitsWithRetry(
        owner,
        name,
        sinceTimestamp,
        mappings.verifiedTokens,
      );

      if (!successToken) {
        return await this.handleAllTokensFailed(
          syncLog.id,
          owner,
          name,
          mappings.verifiedTokens.length,
        );
      }

      this.logSyncStats(commits.length, owner, name, mappings);

      // 4. Process and upsert commits
      const { commitsInserted, skippedCount } =
        await this.processAndUpsertCommits(repositoryId, commits, mappings);

      this.logger.log(
        `Sync complete for ${owner}/${name}: ${commitsInserted} inserted, ${skippedCount} skipped.`,
      );

      // 5. Update success status
      await this.updateSyncSuccess(
        syncLog.id,
        repositoryId,
        commits.length,
        commitsInserted,
        startTime,
      );
    } catch (error: unknown) {
      await this.handleSyncFailure(
        syncLog.id,
        repositoryId,
        owner,
        name,
        error,
      );
      throw error;
    }
  }

  private async getProjectMemberMappings(projectId: string) {
    const projectMembers = await this.prisma.projectMember.findMany({
      where: { project_id: projectId },
    });

    const studentIds = projectMembers.map((m) => m.student_id);
    const mappings =
      await this.githubMappingRepository.findByStudentIds(studentIds);

    const verifiedTokens: string[] = [];
    const githubIdToMemberIdMap = new Map<string, string>();
    const usernameToMemberIdMap = new Map<string, string>();
    const emailToMemberIdMap = new Map<string, string>();

    // Map studentId to memberId for easy lookup
    const studentIdToMemberId = new Map(
      projectMembers.map((m) => [m.student_id, m.id]),
    );

    for (const mapping of mappings) {
      const memberId = studentIdToMemberId.get(mapping.studentId);
      if (!memberId) continue;

      if (mapping.isVerified) {
        if (
          mapping.accessToken &&
          !verifiedTokens.includes(mapping.accessToken)
        ) {
          verifiedTokens.push(mapping.accessToken);
        }
        if (mapping.githubId) {
          githubIdToMemberIdMap.set(mapping.githubId, memberId);
        }
        if (mapping.githubUsername) {
          usernameToMemberIdMap.set(
            mapping.githubUsername.toLowerCase(),
            memberId,
          );
        }
        if (mapping.githubEmail) {
          emailToMemberIdMap.set(mapping.githubEmail.toLowerCase(), memberId);
        }
      }
    }

    return {
      verifiedTokens,
      githubIdToMemberIdMap,
      usernameToMemberIdMap,
      emailToMemberIdMap,
    };
  }

  private async fetchCommitsWithRetry(
    owner: string,
    name: string,
    sinceTimestamp: Date | null,
    tokens: string[],
  ) {
    let commits: GitHubCommitInfo[] = [];
    let successToken: string | null = null;

    for (const currentToken of tokens) {
      try {
        commits = await this.githubService.getCommitsWithStats(
          owner,
          name,
          sinceTimestamp,
          currentToken,
        );
        successToken = currentToken;
        break;
      } catch (error) {
        this.logger.warn(
          `Token failed for ${owner}/${name}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return { commits, successToken };
  }

  private async processAndUpsertCommits(
    repositoryId: string,
    commits: GitHubCommitInfo[],
    mappings: MemberMappings,
  ) {
    if (commits.length === 0) return { commitsInserted: 0, skippedCount: 0 };

    const hashes = commits.map((c) => c.hash);
    const existingCommits = await this.prisma.commit.findMany({
      where: {
        repository_id: repositoryId,
        hash: { in: hashes },
      },
      select: { hash: true },
    });

    const existingHashes = new Set(existingCommits.map((c) => c.hash));
    const newCommitsToInsert: any[] = [];
    let skippedCount = 0;

    for (const commit of commits) {
      if (existingHashes.has(commit.hash)) continue;

      const memberId = this.findMemberIdForCommit(commit, mappings);

      if (!memberId) {
        this.logger.debug(
          `Skipping commit: ${commit.hash.substring(0, 7)} by ${commit.authorUsername || 'unknown'} <${commit.authorEmail}>`,
        );
        skippedCount++;
        continue;
      }

      newCommitsToInsert.push({
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
      });
    }

    if (newCommitsToInsert.length > 0) {
      await this.prisma.commit.createMany({
        data: newCommitsToInsert,
        skipDuplicates: true,
      });
    }

    return { commitsInserted: newCommitsToInsert.length, skippedCount };
  }

  private findMemberIdForCommit(
    commit: GitHubCommitInfo,
    mappings: MemberMappings,
  ): string | null {
    // Try GitHub ID mapping first
    if (commit.authorGithubId) {
      const id = mappings.githubIdToMemberIdMap.get(commit.authorGithubId);
      if (id) return id;
    }

    // Fallback to username mapping
    if (commit.authorUsername) {
      const id = mappings.usernameToMemberIdMap.get(
        commit.authorUsername.toLowerCase(),
      );
      if (id) return id;
    }

    // Fallback to email mapping
    if (commit.authorEmail) {
      const id = mappings.emailToMemberIdMap.get(
        commit.authorEmail.toLowerCase(),
      );
      if (id) return id;
    }

    return null;
  }

  private async handleNoTokensFound(syncLogId: string, projectId: string) {
    this.logger.warn(
      `No verified GitHub tokens found for project ${projectId}`,
    );
    await this.prisma.syncLog.update({
      where: { id: syncLogId },
      data: {
        status: 'FAILED',
        completed_at: new Date(),
        log_message: 'No verified GitHub token available among project members',
      },
    });
  }

  private async handleAllTokensFailed(
    syncLogId: string,
    owner: string,
    name: string,
    tokenCount: number,
  ) {
    const errorMessage = `None of the ${tokenCount} available tokens could access repository ${owner}/${name}`;
    this.logger.error(errorMessage);
    await this.prisma.syncLog.update({
      where: { id: syncLogId },
      data: {
        status: 'FAILED',
        completed_at: new Date(),
        log_message: errorMessage,
      },
    });
  }

  private async updateSyncSuccess(
    syncLogId: string,
    repositoryId: string,
    commitsFound: number,
    commitsInserted: number,
    startTime: number,
  ) {
    await this.prisma.repository.update({
      where: { id: repositoryId },
      data: {
        last_scanned_at: new Date(),
        scan_status: 'SUCCESS',
        error_message: null,
      },
    });

    await this.prisma.syncLog.update({
      where: { id: syncLogId },
      data: {
        status: 'SUCCESS',
        completed_at: new Date(),
        commits_found: commitsFound,
        commits_inserted: commitsInserted,
        execution_time_ms: Date.now() - startTime,
      },
    });
  }

  private async handleSyncFailure(
    syncLogId: string,
    repositoryId: string,
    owner: string,
    name: string,
    error: any,
  ) {
    this.logger.error(`Failed to process sync for ${owner}/${name}`, error);
    const errorMessage = (
      error instanceof Error ? error.message : String(error)
    ).substring(0, 1000);

    await this.prisma.syncLog.update({
      where: { id: syncLogId },
      data: {
        status: 'FAILED',
        completed_at: new Date(),
        log_message: errorMessage,
      },
    });

    await this.prisma.repository.update({
      where: { id: repositoryId },
      data: {
        scan_status: 'FAILED',
        error_message: errorMessage,
      },
    });
  }

  private logSyncStats(
    commitCount: number,
    owner: string,
    name: string,
    mappings: MemberMappings,
  ) {
    this.logger.log(
      `Fetched ${commitCount} commits for ${owner}/${name}. GithubIdMap: ${mappings.githubIdToMemberIdMap.size}, UsernameMap: ${mappings.usernameToMemberIdMap.size}, EmailMap: ${mappings.emailToMemberIdMap.size}`,
    );

    if (
      mappings.githubIdToMemberIdMap.size > 0 ||
      mappings.usernameToMemberIdMap.size > 0 ||
      mappings.emailToMemberIdMap.size > 0
    ) {
      this.logger.log('--- CURRENT PROJECT MAPPINGS ---');
      mappings.githubIdToMemberIdMap.forEach((id: string, gid: string) =>
        this.logger.log(`Mapped GithubID: ${gid} -> Member: ${id}`),
      );
      mappings.usernameToMemberIdMap.forEach((id: string, user: string) =>
        this.logger.log(`Mapped User: ${user} -> Member: ${id}`),
      );
      mappings.emailToMemberIdMap.forEach((id: string, email: string) =>
        this.logger.log(`Mapped Email: ${email} -> Member: ${id}`),
      );
      this.logger.log('-------------------------------');
    }
  }
}
