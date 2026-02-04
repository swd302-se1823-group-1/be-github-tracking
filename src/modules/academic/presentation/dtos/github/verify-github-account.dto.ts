import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyGitHubAccountDto {
  @ApiProperty({
    description: 'GitHub OAuth authorization code',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    description: 'OAuth redirect URI (for mobile/SPA)',
    example: 'http://localhost:3000/callback',
  })
  @IsString()
  @IsOptional()
  redirectUri?: string;
}
