import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetProjectByIdQuery } from '../../queries/project/get-project-by-id.query';
import { IProjectRepository } from '../../../domain/repositories/project.repository';
import { ProjectDtoMapper } from '../../../presentation/mappers/project-dto.mapper';
import { ProjectResponseDto } from '../../../presentation/dtos/project/project-response.dto';

@QueryHandler(GetProjectByIdQuery)
export class GetProjectByIdHandler implements IQueryHandler<
  GetProjectByIdQuery,
  ProjectResponseDto
> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(query: GetProjectByIdQuery): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findById(query.id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return ProjectDtoMapper.toResponse(project, query.requesterId);
  }
}
