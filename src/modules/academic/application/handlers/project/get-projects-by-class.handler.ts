import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProjectsByClassQuery } from '../../queries/project/get-projects-by-class.query';
import { Inject } from '@nestjs/common';
import { IProjectRepository } from '@/modules/academic/domain/repositories/project.repository';
import { ProjectAggregate } from '@/modules/academic/domain/aggregates/project.aggregate';

@QueryHandler(GetProjectsByClassQuery)
export class GetProjectsByClassHandler implements IQueryHandler<GetProjectsByClassQuery> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(query: GetProjectsByClassQuery): Promise<{
    projects: ProjectAggregate[];
    total: number;
    nextCursor: string | null;
  }> {
    const { classId, query: paginationQuery } = query;
    return this.projectRepository.findByClassId(classId, paginationQuery);
  }
}
