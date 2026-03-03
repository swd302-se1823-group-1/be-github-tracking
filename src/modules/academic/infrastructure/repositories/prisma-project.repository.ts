import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import {
  IProjectRepository,
  ProjectMemberWithStudent,
} from '../../domain/repositories/project.repository';
import { ProjectAggregate } from '../../domain/aggregates/project.aggregate';
import { ProjectMapper } from '../mappers/project.mapper';
import { GetProjectsDto } from '@/modules/academic/presentation/dtos/project/get-projects.dto';
import { Prisma, ProjectMemberRole } from '@generated/prisma/client';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(project: ProjectAggregate): Promise<ProjectAggregate> {
    // data removed as it was unused and just for mapper check
    const persistenceData: Prisma.ProjectUncheckedCreateInput = {
      id: project.id,
      class_id: project.classId,
      name: project.name,
      topic: project.topic,
      description: project.description,
      avatar_url: project.avatarUrl,
      created_by_id: project.createdBy,
      updated_by_id: project.updatedBy,
      deleted_at: project.deletedAt,
      deleted_by_id: project.deletedBy,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    };

    const newProject = await this.prisma.project.create({
      data: persistenceData,
    });
    return ProjectMapper.toDomain(newProject);
  }

  async update(project: ProjectAggregate): Promise<ProjectAggregate> {
    const updated = await this.prisma.project.update({
      where: { id: project.id },
      data: ProjectMapper.toUpdateData(project),
    });
    return ProjectMapper.toDomain(updated);
  }

  async findById(id: string): Promise<ProjectAggregate | null> {
    // implementation same as before
    const found = await this.prisma.project.findUnique({
      where: { id, deleted_at: null },
      include: {
        project_members: {
          where: { deleted_at: null, is_active: true },
        },
      },
    });
    return found ? ProjectMapper.toDomain(found) : null;
  }

  async findByClassId(
    classId: string,
    query: GetProjectsDto,
  ): Promise<{
    projects: ProjectAggregate[];
    total: number;
    nextCursor: string | null;
  }> {
    const { cursor, take = 10, search } = query;
    const where: Prisma.ProjectWhereInput = {
      class_id: classId,
      deleted_at: null,
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
    };

    const [total, projects] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        take: take ? take + 1 : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { created_at: 'desc' }, // Ignoring query.order for now or implement mapping
        skip: cursor ? 1 : 0,
        include: {
          project_members: {
            where: { deleted_at: null, is_active: true },
          },
        },
      }),
    ]);

    let nextCursor: string | null = null;
    if (projects.length > take) {
      const nextItem = projects.pop();
      nextCursor = nextItem?.id ? nextItem.id : null;
    }

    return {
      projects: projects.map((p) => ProjectMapper.toDomain(p)),
      total,
      nextCursor,
    };
  }

  async findByMemberId(memberId: string): Promise<ProjectAggregate[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        deleted_at: null,
        project_members: {
          some: {
            student_id: memberId,
            deleted_at: null,
            is_active: true,
          },
        },
      },
      include: {
        project_members: {
          where: { deleted_at: null, is_active: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return projects.map((p) => ProjectMapper.toDomain(p));
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id: deletedBy,
      },
    });
  }

  async addMember(
    projectId: string,
    studentId: string,
    role: ProjectMemberRole,
  ): Promise<void> {
    await this.prisma.projectMember.create({
      data: {
        project_id: projectId,
        student_id: studentId,
        role: role,
      },
    });
  }

  async removeMember(projectId: string, studentId: string): Promise<void> {
    await this.prisma.projectMember.update({
      where: {
        project_id_student_id: {
          project_id: projectId,
          student_id: studentId,
        },
      },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });
  }

  // Validation helpers
  async isStudentInProject(
    projectId: string,
    studentId: string,
  ): Promise<boolean> {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        project_id_student_id: {
          project_id: projectId,
          student_id: studentId,
        },
      },
    });
    return member !== null && member.deleted_at === null;
  }

  async getStudentProjectInClass(
    classId: string,
    studentId: string,
  ): Promise<ProjectAggregate | null> {
    const project = await this.prisma.project.findFirst({
      where: {
        class_id: classId,
        deleted_at: null,
        project_members: {
          some: {
            student_id: studentId,
            deleted_at: null,
            is_active: true,
          },
        },
      },
      include: {
        project_members: {
          where: { deleted_at: null, is_active: true },
        },
      },
    });

    return project ? ProjectMapper.toDomain(project) : null;
  }

  async getProjectMemberCount(projectId: string): Promise<number> {
    return this.prisma.projectMember.count({
      where: {
        project_id: projectId,
        deleted_at: null,
        is_active: true,
      },
    });
  }

  async getMembers(projectId: string): Promise<ProjectMemberWithStudent[]> {
    return this.prisma.projectMember.findMany({
      where: {
        project_id: projectId,
        deleted_at: null,
        is_active: true,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        joined_at: 'asc',
      },
    });
  }
}
