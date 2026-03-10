import { ApiProperty } from '@nestjs/swagger';

export class ProjectStudentStatsItemDto {
  @ApiProperty()
  studentId: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  totalCommits: number;

  @ApiProperty()
  totalAdditions: number;

  @ApiProperty()
  totalDeletions: number;

  @ApiProperty()
  totalFilesChanged: number;
}
