import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RepositoryResponseDto } from './response/repository-response.dto';

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
  memberCount: number;

  @ApiPropertyOptional()
  class?: {
    id?: string;
    code?: string;
    name?: string;
  };

  @ApiProperty()
  members: ProjectMemberResponseDto[];

  @ApiProperty({ type: [RepositoryResponseDto] })
  repositories: RepositoryResponseDto[];

  @ApiProperty()
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Whether the current caller is a member of this project',
  })
  isMember?: boolean;

  @ApiPropertyOptional({
    description:
      'Role of the current caller in this project (null if not a member)',
    enum: ['LEADER', 'MEMBER'],
  })
  myRole?: string | null;

  constructor(partial: Partial<ProjectResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ProjectMemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentId: string;

  @ApiPropertyOptional()
  fullName?: string;

  @ApiPropertyOptional()
  studentCode?: string;

  @ApiPropertyOptional()
  universityEmail?: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiProperty()
  role: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  joinedAt: Date;

  constructor(partial: Partial<ProjectMemberResponseDto>) {
    Object.assign(this, partial);
  }
}
