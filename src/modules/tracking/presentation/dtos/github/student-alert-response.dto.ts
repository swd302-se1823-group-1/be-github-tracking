import { ApiProperty } from '@nestjs/swagger';

export class StudentAlertItemDto {
  @ApiProperty() studentId: string;
  @ApiProperty() studentCode: string;
  @ApiProperty() name: string;
  @ApiProperty() commits: number;
  @ApiProperty({ nullable: true }) lastCommitDate: string | null;
  @ApiProperty() isInactive: boolean;
  @ApiProperty() contributionRatio: number;
  @ApiProperty({ enum: ['NONE', 'LOW', 'HIGH'] }) warningLevel: string;
}
