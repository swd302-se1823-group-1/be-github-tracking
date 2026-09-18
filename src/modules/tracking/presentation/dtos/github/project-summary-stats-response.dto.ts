import { ApiProperty } from '@nestjs/swagger';

export class ProjectSummaryStatsResponseDto {
  @ApiProperty() projectId: string;
  @ApiProperty() totalCommits: number;
  @ApiProperty() totalLinesAdded: number;
  @ApiProperty() totalLinesDeleted: number;
  @ApiProperty() averageCommitsPerStudent: number;
  @ApiProperty() memberCount: number;
}
