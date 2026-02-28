import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetProjectByIdQuery } from '../../queries/project/get-project-by-id.query';
import { IProjectRepository } from '../../../domain/repositories/project.repository';
import { ProjectAggregate } from '../../../domain/aggregates/project.aggregate';

@QueryHandler(GetProjectByIdQuery)
export class GetProjectByIdHandler implements IQueryHandler<
  GetProjectByIdQuery,
  ProjectAggregate
> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(query: GetProjectByIdQuery): Promise<ProjectAggregate> {
    const project = await this.projectRepository.findById(query.id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
