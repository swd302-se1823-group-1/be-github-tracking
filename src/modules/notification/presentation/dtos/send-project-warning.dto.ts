import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsNotEmpty, MaxLength } from 'class-validator';

export class SendProjectWarningDto {
  @ApiProperty({
    example: 'You have been inactive for 5 days. Please update your progress.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @ApiProperty({ enum: ['INACTIVITY', 'LOW_COMMITS', 'GENERAL'] })
  @IsIn(['INACTIVITY', 'LOW_COMMITS', 'GENERAL'])
  warningType: 'INACTIVITY' | 'LOW_COMMITS' | 'GENERAL';
}
