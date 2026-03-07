import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectMemberRole } from '@generated/prisma/client';

export class ProjectMemberItemDto {
  @ApiProperty({ example: 'uuid-of-student' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ enum: ProjectMemberRole, example: ProjectMemberRole.MEMBER })
  @IsEnum(ProjectMemberRole)
  @IsNotEmpty()
  role: ProjectMemberRole;
}

export class AddProjectMemberDto {
  @ApiProperty({
    type: [ProjectMemberItemDto],
    description: 'Array of members to add to the project',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProjectMemberItemDto)
  members: ProjectMemberItemDto[];
}
