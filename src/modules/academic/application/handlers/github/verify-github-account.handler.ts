import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { VerifyGitHubAccountCommand } from '@/modules/academic/application/commands/github/verify-github-account.command';
import { IGithubMappingRepository } from '@/modules/academic/domain/repositories/github-mapping.repository';
import { GithubMappingAggregate } from '@/modules/academic/domain/aggregates/github-mapping.aggregate';
import { GitHubService } from '@/modules/auth/infrastructure/services/github.service';

@CommandHandler(VerifyGitHubAccountCommand)
export class VerifyGitHubAccountHandler implements ICommandHandler<
  VerifyGitHubAccountCommand,
  GithubMappingAggregate
> {
  constructor(
    private readonly githubMappingRepository: IGithubMappingRepository,
    private readonly githubService: GitHubService,
  ) {}

  async execute(
    command: VerifyGitHubAccountCommand,
  ): Promise<GithubMappingAggregate> {
    const { studentId, code, redirectUri } = command;

    // Step 1: Exchange code for GitHub profile
    const githubProfile = await this.githubService.exchangeCodeForProfile(
      code,
      redirectUri,
    );

    // Step 2: Check if GitHub email is already mapped to another student
    if (githubProfile.email) {
      const existingByEmail =
        await this.githubMappingRepository.findByGitHubEmail(
          githubProfile.email,
        );
      if (existingByEmail && existingByEmail.studentId !== studentId) {
        throw new ConflictException(
          'This GitHub email is already linked to another student',
        );
      }
    }

    // Step 3: Check if GitHub username is already mapped to another student
    const existingByUsername =
      await this.githubMappingRepository.findByGitHubUsername(
        githubProfile.username,
      );
    if (existingByUsername && existingByUsername.studentId !== studentId) {
      throw new ConflictException(
        'This GitHub username is already linked to another student',
      );
    }

    // Step 4: Find or create GitHub mapping for current student
    let mapping = await this.githubMappingRepository.findByStudentId(studentId);

    if (mapping) {
      // Update existing mapping
      mapping.updateGithubInfo(
        githubProfile.email,
        githubProfile.username,
        studentId,
      );
    } else {
      // Create new verified mapping
      mapping = GithubMappingAggregate.createVerified(
        studentId,
        githubProfile.email,
        githubProfile.username,
        studentId,
      );
    }

    // Step 5: Save to repository
    const savedMapping = await this.githubMappingRepository.save(mapping);

    return savedMapping;
  }
}
