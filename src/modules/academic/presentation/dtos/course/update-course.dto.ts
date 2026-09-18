import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCourseDto {
  @ApiPropertyOptional({ description: 'Course name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}
