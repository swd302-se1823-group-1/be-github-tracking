import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GoogleExchangeCodeDto {
  @ApiProperty({ example: '4/0AeaYSH...' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'postmessage', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  redirectUri?: string;
}
