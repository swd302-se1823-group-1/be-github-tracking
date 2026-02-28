import { ProjectAggregate } from '../../domain/aggregates/project.aggregate';
import { ProjectMemberEntity } from '../../domain/entities/project-member.entity';
import { ProjectMemberWithStudent } from '../../domain/repositories/project.repository';
import {
  ProjectMemberResponseDto,
  ProjectResponseDto,
} from '../dtos/project/project-response.dto';

export class ProjectDtoMapper {
  static toResponse(aggregate: ProjectAggregate): ProjectResponseDto {
    return new ProjectResponseDto({
      id: aggregate.id,
      classId: aggregate.classId,
      name: aggregate.name,
      topic: aggregate.topic,
      description: aggregate.description,
      avatarUrl: aggregate.avatarUrl,
      members: aggregate.members.map((m) =>
        ProjectDtoMapper.toMemberResponse(m),
      ),
      createdAt: aggregate.createdAt,
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
