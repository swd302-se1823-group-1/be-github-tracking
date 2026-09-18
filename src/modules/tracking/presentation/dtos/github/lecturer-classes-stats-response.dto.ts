import { ApiProperty } from '@nestjs/swagger';

export class LecturerClassesStatsItemDto {
  @ApiProperty()
  classId: string;

  @ApiProperty()
  classCode: string;

  @ApiProperty()
  className: string;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  totalProjects: number;

  @ApiProperty()
  totalCommits: number;

  @ApiProperty()
  totalAdditions: number;

  @ApiProperty()
  totalDeletions: number;

  @ApiProperty()
  totalFilesChanged: number;
}
