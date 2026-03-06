import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Github Tracking System' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Web Development' })
  @IsString()
  @IsOptional()
  topic: string;

  @ApiPropertyOptional({ example: 'A system to track student commits.' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsNumber()
  @IsOptional()
  maxMembers?: number;
}
