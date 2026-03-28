import { ApiProperty } from '@nestjs/swagger';

export class ProjectRankingResponseDto {
  @ApiProperty() projectId: string;
  @ApiProperty() classRank: number;
  @ApiProperty() totalProjectsInClass: number;
  @ApiProperty() percentile: number;
  @ApiProperty({ enum: ['EXCELLENT', 'ABOVE_AVERAGE', 'AVERAGE', 'BELOW_AVERAGE'] })
  evaluation: string;
}
