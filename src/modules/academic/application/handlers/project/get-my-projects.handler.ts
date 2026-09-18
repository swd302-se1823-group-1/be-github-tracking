import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyProjectsQuery } from '../../queries/project/get-my-projects.query';
import { Inject } from '@nestjs/common';
import { IProjectRepository } from '@/modules/academic/domain/repositories/project.repository';
import { ProjectAggregate } from '@/modules/academic/domain/aggregates/project.aggregate';

@QueryHandler(GetMyProjectsQuery)
export class GetMyProjectsHandler implements IQueryHandler<GetMyProjectsQuery> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(query: GetMyProjectsQuery): Promise<ProjectAggregate[]> {
    const { userId } = query;
    return this.projectRepository.findByMemberId(userId);
  }
}
