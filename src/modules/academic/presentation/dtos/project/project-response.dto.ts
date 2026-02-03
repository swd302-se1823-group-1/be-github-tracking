import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectAggregate } from '@/modules/academic/domain/aggregates/project.aggregate';
import { ProjectMemberEntity } from '@/modules/academic/domain/entities/project-member.entity';

export class ProjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  classId: string;

  @ApiPropertyOptional()
  name: string | null;

  @ApiPropertyOptional()
  topic: string | null;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  avatarUrl: string | null;

  @ApiProperty()
  members: ProjectMemberResponseDto[];

  @ApiProperty()
  createdAt?: Date;

  constructor(aggregate: ProjectAggregate) {
    this.id = aggregate.id;
    this.classId = aggregate.classId;
    this.name = aggregate.name;
    this.topic = aggregate.topic;
    this.description = aggregate.description;
    this.avatarUrl = aggregate.avatarUrl;
    this.members = aggregate.members.map(
      (m) => new ProjectMemberResponseDto(m),
    );
    this.createdAt = aggregate.createdAt;
  }
}

export class ProjectMemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  joinedAt: Date;

  constructor(entity: ProjectMemberEntity) {
    this.id = entity.id;
    this.studentId = entity.studentId;
    this.role = entity.role;
    this.isActive = entity.isActive;
    this.joinedAt = entity.joinedAt;
  }
}
