import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProjectMembersQuery } from '../../queries/project/get-project-members.query';
import { Inject } from '@nestjs/common';
import {
  IProjectRepository,
  ProjectMemberWithStudent,
} from '@/modules/academic/domain/repositories/project.repository';

@QueryHandler(GetProjectMembersQuery)
export class GetProjectMembersHandler implements IQueryHandler<GetProjectMembersQuery> {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    query: GetProjectMembersQuery,
  ): Promise<ProjectMemberWithStudent[]> {
    const { projectId } = query;
    return this.projectRepository.getMembers(projectId);
  }
}
