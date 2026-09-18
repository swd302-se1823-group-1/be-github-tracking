import { ProjectAggregate } from '../aggregates/project.aggregate';
import { GetProjectsDto } from '@/modules/academic/presentation/dtos/project/get-projects.dto';
import { Prisma, ProjectMemberRole } from '@generated/prisma/client';

export type ProjectMemberWithStudent = Prisma.ProjectMemberGetPayload<{
  include: {
    student: {
      include: {
        user: true;
      };
    };
  };
}>;

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
  findByMemberId(memberId: string): Promise<ProjectAggregate[]>;
  delete(id: string, deletedBy: string): Promise<void>;

  // Member management
  addMember(
    projectId: string,
    studentId: string,
    role: ProjectMemberRole,
  ): Promise<void>;
  removeMember(projectId: string, studentId: string): Promise<void>;

  // Validation helpers
  isStudentInProject(projectId: string, studentId: string): Promise<boolean>;
  getStudentProjectInClass(
    classId: string,
    studentId: string,
  ): Promise<ProjectAggregate | null>;
  getProjectMemberCount(projectId: string): Promise<number>;
  getMembers(projectId: string): Promise<ProjectMemberWithStudent[]>;
}

export const IProjectRepository = Symbol('IProjectRepository');
