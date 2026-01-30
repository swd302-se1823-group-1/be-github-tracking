import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class GoogleExchangeCodeDto {
  @ApiProperty({ example: '4/0AeaYSH...' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'postmessage', required: false })
  @IsString()
  @IsNotEmpty()
  redirectUri?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isMobile?: boolean;
}
