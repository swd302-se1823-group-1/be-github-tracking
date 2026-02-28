import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
