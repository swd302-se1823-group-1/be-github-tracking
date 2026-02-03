import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

// Standardize using enum from Prisma if possible, but DTO separates layers.
// Keep existing enum but ensure values match DB.
// DB has 'LEADER', 'MEMBER'.
export enum ProjectRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER',
}

export class AddProjectMemberDto {
  @ApiProperty({ example: 'uuid-of-student' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ enum: ProjectRole, example: ProjectRole.MEMBER })
  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole;
}
