import { Prisma, Repository } from '@generated/prisma/client';
import { RepositoryAggregate } from '../../domain/aggregates/repository.aggregate';

export class RepositoryMapper {
  static toDomain(prismaRepository: Repository): RepositoryAggregate {
    return RepositoryAggregate.reconstitute({
      id: prismaRepository.id,
      projectId: prismaRepository.project_id,
      url: prismaRepository.url,
      name: prismaRepository.name,
      organization: prismaRepository.organization,
      owner: prismaRepository.owner,
      lastScannedAt: prismaRepository.last_scanned_at,
      scanStatus: prismaRepository.scan_status,
      errorMessage: prismaRepository.error_message,
      createdAt: prismaRepository.created_at,
      updatedAt: prismaRepository.updated_at,
      createdBy: prismaRepository.created_by_id,
      updatedBy: prismaRepository.updated_by_id,
      deletedAt: prismaRepository.deleted_at,
      deletedBy: prismaRepository.deleted_by_id,
    });
  }

  static toUpdateData(
    aggregate: RepositoryAggregate,
  ): Prisma.RepositoryUncheckedUpdateInput {
    return {
      scan_status: aggregate.scanStatus,
      last_scanned_at: aggregate.lastScannedAt,
      error_message: aggregate.errorMessage,
      updated_at: aggregate.updatedAt,
      updated_by_id: aggregate.updatedBy,
      deleted_at: aggregate.deletedAt,
      deleted_by_id: aggregate.deletedBy,
    };
  }
}
