import { ApiProperty } from '@nestjs/swagger';
import { GithubMappingAggregate } from '@/modules/academic/domain/aggregates/github-mapping.aggregate';

export class GithubMappingResponseDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'user@github.com' })
  githubEmail: string | null;

  @ApiProperty({ example: 'octocat' })
  githubUsername: string | null;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(mapping: GithubMappingAggregate) {
    this.id = mapping.id.toString();
    this.githubEmail = mapping.githubEmail;
    this.githubUsername = mapping.githubUsername;
    this.isVerified = mapping.isVerified;
    this.createdAt = mapping.createdAt;
    this.updatedAt = mapping.updatedAt;
  }
}
