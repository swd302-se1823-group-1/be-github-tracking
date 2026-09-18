import { ApiProperty } from '@nestjs/swagger';
import { RepositoryAggregate } from '../../../../domain/aggregates/repository.aggregate';

export class RepositoryResponseDto {
  @ApiProperty({ example: 'uuid', description: 'Repository ID' })
  id: string;

  @ApiProperty({ example: 'uuid', description: 'Project ID' })
  projectId: string;

  @ApiProperty({
    example: 'https://github.com/owner/repo',
    description: 'Repository URL',
  })
  url: string;

  @ApiProperty({ example: 'repo-name', description: 'Repository Name' })
  name: string;

  @ApiProperty({
    example: 'owner-org',
    description: 'Organization or Owner Name',
  })
  organization: string;

  @ApiProperty({ example: 'owner', description: 'Repository Owner' })
  owner: string;

  @ApiProperty({
    example: 'pending',
    description: 'Status of the initial scan',
  })
  scanStatus: string;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Error message from scan',
  })
  errorMessage: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    nullable: true,
    description: 'Last scanned time',
  })
  lastScannedAt: Date | null;

  constructor(repository: RepositoryAggregate) {
    this.id = repository.id;
    this.projectId = repository.projectId;
    this.url = repository.url;
    this.name = repository.name;
    this.organization = repository.organization;
    this.owner = repository.owner;
    this.scanStatus = repository.scanStatus;
    this.errorMessage = repository.errorMessage;
    this.lastScannedAt = repository.lastScannedAt;
  }
}
