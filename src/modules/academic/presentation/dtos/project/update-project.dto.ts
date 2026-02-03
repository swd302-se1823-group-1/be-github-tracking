import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Github Tracking System' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Web Development' })
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiPropertyOptional({ example: 'A system to track student commits.' })
  @IsString()
  @IsOptional()
  description?: string;
}
