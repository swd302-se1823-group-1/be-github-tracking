import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { LinkRepositoryCommand } from '../../commands/repository/link-repository.command';
import { IRepositoryRepository } from '../../../domain/repositories/repository.repository';
import { IProjectRepository } from '../../../domain/repositories/project.repository';
import { IGithubMappingRepository } from '@/modules/tracking/domain/repositories/github-mapping.repository';
import { RepositoryAggregate } from '../../../domain/aggregates/repository.aggregate';
import { Transactional } from '@nestjs-cls/transactional';
import { GitHubService } from '@/modules/tracking/application/services/github.service';

@CommandHandler(LinkRepositoryCommand)
export class LinkRepositoryHandler implements ICommandHandler<
  LinkRepositoryCommand,
  RepositoryAggregate
> {
  constructor(
    @Inject(IRepositoryRepository)
    private readonly repositoryRepository: IRepositoryRepository,
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    @Inject(IGithubMappingRepository)
    private readonly githubMappingRepository: IGithubMappingRepository,
    private readonly githubService: GitHubService,
  ) {}

  @Transactional()
  async execute(command: LinkRepositoryCommand): Promise<RepositoryAggregate> {
    const { projectId, url, currentUserId } = command;

    // 1. Verify Project exists and Authorization
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if the current user is a member of the project
    if (!project.hasMember(currentUserId)) {
      throw new BadRequestException(
        'Only project members can link a repository to this project.',
      );
    }

    // 2. Extract owner/repo from URL with robust regex
    const githubUrlRegex =
      /^https?:\/\/(www\.)?github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/;
    const match = url.trim().match(githubUrlRegex);

    if (!match) {
      throw new BadRequestException(
        'Invalid GitHub repository URL. Must be in format https://github.com/owner/repo',
      );
    }

    const ownerFromUrl = match[2];
    const repoNameFromUrl = match[3];

    // 3. Verify duplicate URL in system
    const existingRepo = await this.repositoryRepository.findByUrl(url);
    if (existingRepo) {
      if (existingRepo.projectId === projectId) {
        throw new ConflictException(
          'This repository is already linked to this project',
        );
      }
      throw new ConflictException(
        'This repository is already linked to another project in the system',
      );
    }

    // 4. Get Student's GitHub Mapping for Access Token
    const githubMapping =
      await this.githubMappingRepository.findByStudentId(currentUserId);

    if (
      !githubMapping ||
      !githubMapping.accessToken ||
      !githubMapping.isVerified
    ) {
      throw new BadRequestException(
        'You must verify your GitHub account before linking a repository.',
      );
    }

    // 5. Validate against GitHub API using GitHubService
    const githubData = await this.githubService.getRepositoryData(
      ownerFromUrl,
      repoNameFromUrl,
      githubMapping.accessToken,
    );

    // 6. Create the Aggregate and Save
    const repositoryAggregate = RepositoryAggregate.create(
      projectId,
      url,
      githubData.name,
      githubData.owner,
      githubData.organization,
      currentUserId,
    );

    const saved = await this.repositoryRepository.create(repositoryAggregate);
    return saved;
  }
}
