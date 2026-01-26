import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  accessToken: string;

  constructor(partial: Partial<TokenResponseDto>) {
    Object.assign(this, partial);
  }
}
