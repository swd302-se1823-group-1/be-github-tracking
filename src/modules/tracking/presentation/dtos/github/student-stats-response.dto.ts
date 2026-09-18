import { ApiProperty } from '@nestjs/swagger';

export class StudentStatsResponseDto {
  @ApiProperty({ example: 120 })
  totalCommits: number;

  @ApiProperty({ example: 4500 })
  totalAdditions: number;

  @ApiProperty({ example: 1200 })
  totalDeletions: number;

  @ApiProperty({ example: 45 })
  totalFilesChanged: number;

  constructor(data: {
    totalCommits: number;
    totalAdditions: number;
    totalDeletions: number;
    totalFilesChanged: number;
  }) {
    this.totalCommits = data.totalCommits;
    this.totalAdditions = data.totalAdditions;
    this.totalDeletions = data.totalDeletions;
    this.totalFilesChanged = data.totalFilesChanged;
  }
}
