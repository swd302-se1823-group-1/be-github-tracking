import { ProjectAggregate } from '../aggregates/project.aggregate';
import { GetProjectsDto } from '@/modules/academic/presentation/dtos/project/get-projects.dto';

export interface IProjectRepository {
  create(project: ProjectAggregate): Promise<ProjectAggregate>;
  update(project: ProjectAggregate): Promise<ProjectAggregate>;
  findById(id: string): Promise<ProjectAggregate | null>;
  findByClassId(
    classId: string,
    query: GetProjectsDto,
  ): Promise<{
    projects: ProjectAggregate[];
    total: number;
    nextCursor: string | null;
  }>;
  delete(id: string, deletedBy: string): Promise<void>;

  // Member management might be handled via update(aggregate) or separate methods depending on granularity
  // For now, assuming ProjectAggregate holds members and we save the aggregate.
  // But strictly speaking, adding a member is a sub-entity operation.
  // Let's keep it simple: generic update or specific member methods if needed.
  addMember(projectId: string, studentId: string, role: string): Promise<void>;
  driverRemoveMember(projectId: string, studentId: string): Promise<void>; // Naming to avoid conflict with standard delete
  removeMember(projectId: string, studentId: string): Promise<void>;
}

export const IProjectRepository = Symbol('IProjectRepository');
