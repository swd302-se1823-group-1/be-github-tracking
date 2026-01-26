import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { CursorPageOptionsDto } from '@/shared/dtos/cursor-page-options.dto';
import { UserRole } from '../../domain/enums/user-role.enum';

export class GetUsersDto extends CursorPageOptionsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly searchEmail?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  readonly role?: UserRole;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value as boolean;
  })
  readonly isActive?: boolean;
}
