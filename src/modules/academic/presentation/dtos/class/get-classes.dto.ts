import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CursorPageOptionsDto } from '@/shared/dtos/cursor-page-options.dto';

export class GetClassesDto extends CursorPageOptionsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly courseCode?: string;
}
