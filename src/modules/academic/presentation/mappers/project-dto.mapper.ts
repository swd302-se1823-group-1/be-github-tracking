import { ProjectAggregate } from '../../domain/aggregates/project.aggregate';
import { ProjectMemberEntity } from '../../domain/entities/project-member.entity';
import { ProjectMemberWithStudent } from '../../domain/repositories/project.repository';
import {
  ProjectMemberResponseDto,
  ProjectResponseDto,
} from '../dtos/project/project-response.dto';
import { RepositoryResponseDto } from '../dtos/project/response/repository-response.dto';

export class ProjectDtoMapper {
  static toResponse(
    aggregate: ProjectAggregate,
    requesterId?: string,
  ): ProjectResponseDto {
    const myMember = requesterId
      ? aggregate.members.find(
          (m) => m.studentId === requesterId && m.isActive && !m.deletedAt,
        )
      : undefined;

    return new ProjectResponseDto({
      id: aggregate.id,
      classId: aggregate.classId,
      name: aggregate.name,
      topic: aggregate.topic,
      description: aggregate.description,
      avatarUrl: aggregate.avatarUrl,
      memberCount: aggregate.getActiveMemberCount(),
      class: aggregate.classInfo
        ? {
            id: aggregate.classId,
            code: aggregate.classInfo.code,
            name: aggregate.classInfo.name,
          }
        : undefined,
      members: aggregate.members.map((m) =>
        ProjectDtoMapper.toMemberResponse(m),
      ),
      repositories:
        aggregate.repositories?.map((r) => new RepositoryResponseDto(r)) || [],
      createdAt: aggregate.createdAt,
      isMember: requesterId !== undefined ? !!myMember : undefined,
      myRole: requesterId !== undefined ? (myMember?.role ?? null) : undefined,
    });
  }

  static toMemberResponse(
    entity: ProjectMemberEntity,
  ): ProjectMemberResponseDto {
    return new ProjectMemberResponseDto({
      id: entity.id,
      studentId: entity.studentId,
      role: entity.role,
      isActive: entity.isActive,
      joinedAt: entity.joinedAt,
    });
  }

  static toMemberResponseFromPrisma(
    data: ProjectMemberWithStudent,
  ): ProjectMemberResponseDto {
    return new ProjectMemberResponseDto({
      id: data.id,
      studentId: data.student_id,
      fullName: data.student?.user?.full_name ?? undefined,
      studentCode: data.student?.student_code ?? undefined,
      universityEmail: data.student?.university_email ?? undefined,
      avatarUrl: data.student?.user?.avatar_url ?? undefined,
      role: data.role,
      isActive: data.is_active,
      joinedAt: data.joined_at,
    });
  }
}
