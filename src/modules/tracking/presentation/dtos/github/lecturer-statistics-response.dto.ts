import { ApiProperty } from '@nestjs/swagger';

export class LecturerStatisticsTimelineDto {
  @ApiProperty()
  date: number; // Timestamp

  @ApiProperty()
  linesAdded: number;

  @ApiProperty()
  linesDeleted: number;
}

export class LecturerStatisticsHeatmapDto {
  @ApiProperty()
  date: number; // Timestamp

  @ApiProperty()
  count: number;
}

export class LecturerStatisticsTopContributorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  rank: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  projectName: string;

  @ApiProperty()
  commits: number;

  @ApiProperty()
  linesAdded: number;

  @ApiProperty()
  linesDeleted: number;
}

export class LecturerStatisticsOverviewDto {
  @ApiProperty()
  totalCommits: number;

  @ApiProperty()
  totalLinesAdded: number;

  @ApiProperty()
  totalLinesDeleted: number;

  @ApiProperty()
  activeStudents: number;
}

export class LecturerStatisticsResponseDto {
  @ApiProperty({ type: LecturerStatisticsOverviewDto })
  stats: LecturerStatisticsOverviewDto;

  @ApiProperty({ type: [LecturerStatisticsTimelineDto] })
  trends: LecturerStatisticsTimelineDto[];

  @ApiProperty({ type: [LecturerStatisticsHeatmapDto] })
  heatmap: LecturerStatisticsHeatmapDto[];

  @ApiProperty({ type: [LecturerStatisticsTopContributorDto] })
  topContributors: LecturerStatisticsTopContributorDto[];
}
