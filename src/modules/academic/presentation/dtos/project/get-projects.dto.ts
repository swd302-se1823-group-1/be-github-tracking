import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CursorPageOptionsDto } from '@/shared/dtos/cursor-page-options.dto';

export class GetProjectsDto extends CursorPageOptionsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly search?: string;
}
