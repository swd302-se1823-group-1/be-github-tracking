import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateClassDto {
  @ApiPropertyOptional({ description: 'Class name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  className?: string;

  @ApiPropertyOptional({ description: 'Class description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Enroll password' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  enrollPassword?: string;

  @ApiPropertyOptional({ description: 'Lecturer ID (ADMIN only)' })
  @IsOptional()
  @IsString()
  lecturerId?: string;
}
