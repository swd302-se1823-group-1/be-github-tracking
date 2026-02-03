import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

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

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsUrl()
  @IsOptional()
  avatarUrl: string;
}
