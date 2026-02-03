import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Inject } from '@nestjs/common';
import { IProjectRepository } from '@/modules/academic/domain/repositories/project.repository';
import { ProjectAggregate } from '@/modules/academic/domain/aggregates/project.aggregate';
import { CreateProjectCommand } from '@/modules/academic/application/commands/project/create-project.command';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(command: CreateProjectCommand): Promise<ProjectAggregate> {
    const { classId, name, topic, description, userId } = command;

    // Optional: Check if class exists here or rely on DB constraint.
    // Ideally, validation should happen before or in domain service.
    // For now, proceeding with aggregate creation.

    const project = ProjectAggregate.create(
      classId,
      name,
      topic,
      description,
      null, // avatarUrl will be uploaded separately via PUT /projects/:id/avatar
      userId,
    );

    return this.projectRepository.create(project);
  }
}
