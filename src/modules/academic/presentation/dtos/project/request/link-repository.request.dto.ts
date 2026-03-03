import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class LinkRepositoryRequestDto {
  @ApiProperty({
    description: 'The GitHub repository URL to link',
    example: 'https://github.com/microsoft/vscode',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl(
    { require_protocol: true, host_whitelist: ['github.com'] },
    { message: 'URL must be a valid GitHub repository URL' },
  )
  readonly url: string;
}
