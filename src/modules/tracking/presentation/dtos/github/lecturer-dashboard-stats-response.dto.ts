import { ApiProperty } from '@nestjs/swagger';

export class CommitsTrendDto {
  @ApiProperty()
  date: number;

  @ApiProperty()
  count: number;
}

export class TopStudentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  commits: number;

  @ApiProperty()
  linesOfCode: number;

  @ApiProperty()
  rank: number;
}

export class StudentCommitStatsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  group: string;

  @ApiProperty()
  totalCommits: number;

  @ApiProperty()
  requiredCommits: number;

  @ApiProperty({ type: String, nullable: true })
  lastCommitDate: string | null;

  @ApiProperty()
  status: string; // MEETS_REQUIREMENTS, WARNING, DANGER, etc.
}

export class DashboardSummaryDto {
  @ApiProperty()
  notEnoughCommits: number;

  @ApiProperty()
  belowSixtyPercent: number;

  @ApiProperty()
  meetsRequirements: number;

  @ApiProperty()
  totalStudents: number;
}

export class LecturerDashboardStatsResponseDto {
  @ApiProperty()
  totalCommits: number;

  @ApiProperty()
  totalProjects: number;

  @ApiProperty()
  activeStudents: number;

  @ApiProperty()
  warningStudents: number;

  @ApiProperty({ type: [CommitsTrendDto] })
  commitsTrend: CommitsTrendDto[];

  @ApiProperty({ type: [TopStudentDto] })
  topStudents: TopStudentDto[];

  @ApiProperty({ type: [StudentCommitStatsDto] })
  studentCommits: StudentCommitStatsDto[];

  @ApiProperty({ type: DashboardSummaryDto })
  summary: DashboardSummaryDto;
}
