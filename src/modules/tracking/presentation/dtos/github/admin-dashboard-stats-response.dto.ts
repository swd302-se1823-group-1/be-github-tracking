import { ApiProperty } from '@nestjs/swagger';

export class AdminDashboardGrowthTrendDto {
  @ApiProperty()
  date: number;

  @ApiProperty()
  newStudents: number;

  @ApiProperty()
  newProjects: number;
}

export class AdminDashboardSystemHealthDto {
  @ApiProperty()
  activeRepos: number;

  @ApiProperty()
  totalRepoSizeKb: number;
}

export class AdminDashboardStatsResponseDto {
  @ApiProperty()
  totalLecturers: number;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  totalClasses: number;

  @ApiProperty()
  totalProjects: number;

  @ApiProperty()
  totalCommits: number;

  @ApiProperty({ type: [AdminDashboardGrowthTrendDto] })
  growthTrend: AdminDashboardGrowthTrendDto[];

  @ApiProperty({ type: AdminDashboardSystemHealthDto })
  systemHealth: AdminDashboardSystemHealthDto;
}
