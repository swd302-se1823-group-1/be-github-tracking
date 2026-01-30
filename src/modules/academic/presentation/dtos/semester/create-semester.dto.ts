import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSemesterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)',
  })
  @IsISO8601()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)',
  })
  @IsISO8601()
  @IsOptional()
  endDate?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
