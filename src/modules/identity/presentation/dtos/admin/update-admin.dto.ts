import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAdminDto {
  @ApiProperty({
    description: 'Full Name of the admin',
    example: 'Admin User',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;
}
