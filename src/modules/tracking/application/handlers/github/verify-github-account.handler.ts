import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { VerifyGitHubAccountCommand } from '@/modules/tracking/application/commands/github/verify-github-account.command';
import { IGithubMappingRepository } from '@/modules/tracking/domain/repositories/github-mapping.repository';
import { GithubMappingAggregate } from '@/modules/tracking/domain/aggregates/github-mapping.aggregate';

@CommandHandler(VerifyGitHubAccountCommand)
export class VerifyGitHubAccountHandler implements ICommandHandler<
  VerifyGitHubAccountCommand,
  GithubMappingAggregate
> {
  constructor(
    private readonly githubMappingRepository: IGithubMappingRepository,
  ) {}

  @Transactional()
  async execute(
    command: VerifyGitHubAccountCommand,
  ): Promise<GithubMappingAggregate> {
    const { studentId, githubProfile } = command;

    // Step 1: Check if GitHub ID is already mapped to another student
    const existingById = await this.githubMappingRepository.findByGitHubId(
      githubProfile.providerId,
    );
    if (existingById && existingById.studentId !== studentId) {
      throw new ConflictException(
        'This GitHub account is already linked to another student',
      );
    }

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
        githubProfile.providerId,
        githubProfile.accessToken,
        githubProfile.email,
        githubProfile.username,
        studentId,
      );
    } else {
      // Create new verified mapping
      mapping = GithubMappingAggregate.createVerified(
        studentId,
        githubProfile.providerId,
        githubProfile.accessToken,
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
