import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ProjectMemberRole } from '@generated/prisma/client';

export class AddProjectMemberDto {
  @ApiProperty({ example: 'uuid-of-student' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ enum: ProjectMemberRole, example: ProjectMemberRole.MEMBER })
  @IsEnum(ProjectMemberRole)
  @IsNotEmpty()
  role: ProjectMemberRole;
}
