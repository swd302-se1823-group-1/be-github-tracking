import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '@/modules/academic/domain/repositories/project.repository';
import { UpdateProjectAvatarCommand } from '../../commands/project/update-project-avatar.command';
import { ProjectAggregate } from '@/modules/academic/domain/aggregates/project.aggregate';

@CommandHandler(UpdateProjectAvatarCommand)
export class UpdateProjectAvatarHandler implements ICommandHandler<UpdateProjectAvatarCommand> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    command: UpdateProjectAvatarCommand,
  ): Promise<ProjectAggregate> {
    const { projectId, avatarUrl, updatedBy } = command;

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Update only the avatar URL
    project.update(null, null, null, avatarUrl, updatedBy);

    return this.projectRepository.update(project);
  }
}
