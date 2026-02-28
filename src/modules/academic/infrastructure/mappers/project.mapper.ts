import { ProjectAggregate } from '../../domain/aggregates/project.aggregate';
import { ProjectMemberEntity } from '../../domain/entities/project-member.entity';
import { Prisma, Project, ProjectMember } from '@generated/prisma/client';

// Define exact type expected from Prisma with includes
type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    project_members: true;
  };
}>;

export class ProjectMapper {
  static toDomain(
    prismaProject: ProjectWithRelations | Project,
  ): ProjectAggregate {
    const members =
      (prismaProject as ProjectWithRelations).project_members?.map((pm) =>
        ProjectMapper.toDomainMember(pm),
      ) || [];

    return new ProjectAggregate(
      prismaProject.id,
      prismaProject.class_id,
      prismaProject.name,
      prismaProject.topic,
      prismaProject.description,
      prismaProject.avatar_url,
      members,
      !prismaProject.deleted_at,
      prismaProject.deleted_at,
      prismaProject.deleted_by_id,
      prismaProject.created_at,
      prismaProject.created_by_id,
      prismaProject.updated_at,
      prismaProject.updated_by_id,
    );
  }

  static toDomainMember(prismaMember: ProjectMember): ProjectMemberEntity {
    return new ProjectMemberEntity(
      prismaMember.id,
      prismaMember.project_id,
      prismaMember.student_id,
      prismaMember.role,
      prismaMember.is_active,
      prismaMember.joined_at,
      prismaMember.deleted_at,
      prismaMember.deleted_by_id,
      prismaMember.created_by_id,
      prismaMember.updated_by_id,
    );
  }

  static toPersistence(aggregate: ProjectAggregate): Prisma.ProjectCreateInput {
    // Note: This matches simple create structure. Relations/Members managed separately or via nested write.
    return {
      id: aggregate.id,
      class: { connect: { id: aggregate.classId } },
      name: aggregate.name,
      topic: aggregate.topic,
      description: aggregate.description,
      avatar_url: aggregate.avatarUrl,
      deleted_at: aggregate.deletedAt,
      created_at: aggregate.createdAt,
      updated_at: aggregate.updatedAt,
    };
  }

  static toUpdateData(
    aggregate: ProjectAggregate,
  ): Prisma.ProjectUncheckedUpdateInput {
    return {
      name: aggregate.name,
      topic: aggregate.topic,
      description: aggregate.description,
      avatar_url: aggregate.avatarUrl,
      deleted_at: aggregate.deletedAt,
      deleted_by_id: aggregate.deletedBy,
      updated_by_id: aggregate.updatedBy,
      updated_at: aggregate.updatedAt,
    };
  }
}
