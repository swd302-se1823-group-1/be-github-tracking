import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '@/modules/academic/domain/repositories/project.repository';
import { UpdateProjectCommand } from '../../commands/project/update-project.command';
import { ProjectAggregate } from '@/modules/academic/domain/aggregates/project.aggregate';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler implements ICommandHandler<UpdateProjectCommand> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  @Transactional()
  async execute(command: UpdateProjectCommand): Promise<ProjectAggregate> {
    const { id, name, topic, description, updatedBy } = command;

    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    project.update(
      name ?? null,
      topic ?? null,
      description ?? null,
      null, // avatarUrl should be updated via dedicated upload endpoint
      updatedBy!,
    );

    return this.projectRepository.update(project);
  }
}
