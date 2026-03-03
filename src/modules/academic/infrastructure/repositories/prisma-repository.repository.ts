import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { IRepositoryRepository } from '../../domain/repositories/repository.repository';
import { RepositoryAggregate } from '../../domain/aggregates/repository.aggregate';
import { RepositoryMapper } from '../../presentation/mappers/repository.mapper';
import { Prisma } from '@generated/prisma/client';

@Injectable()
export class PrismaRepositoryRepository implements IRepositoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(repository: RepositoryAggregate): Promise<RepositoryAggregate> {
    const persistenceData: Prisma.RepositoryUncheckedCreateInput = {
      id: repository.id,
      project_id: repository.projectId,
      url: repository.url,
      name: repository.name,
      organization: repository.organization,
      owner: repository.owner,
      last_scanned_at: repository.lastScannedAt,
      scan_status: repository.scanStatus,
      error_message: repository.errorMessage,
      created_at: repository.createdAt,
      updated_at: repository.updatedAt,
      created_by_id: repository.createdBy,
      updated_by_id: repository.updatedBy,
      deleted_at: repository.deletedAt,
      deleted_by_id: repository.deletedBy,
    };

    const newRepository = await this.prisma.repository.create({
      data: persistenceData,
    });
    return RepositoryMapper.toDomain(newRepository);
  }

  async update(repository: RepositoryAggregate): Promise<RepositoryAggregate> {
    const updated = await this.prisma.repository.update({
      where: { id: repository.id },
      data: RepositoryMapper.toUpdateData(repository),
    });
    return RepositoryMapper.toDomain(updated);
  }

  async findById(id: string): Promise<RepositoryAggregate | null> {
    const found = await this.prisma.repository.findUnique({
      where: { id, deleted_at: null },
    });
    return found ? RepositoryMapper.toDomain(found) : null;
  }

  async findByProjectId(projectId: string): Promise<RepositoryAggregate[]> {
    const repositories = await this.prisma.repository.findMany({
      where: { project_id: projectId, deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
    return repositories.map((r) => RepositoryMapper.toDomain(r));
  }

  async findByUrl(url: string): Promise<RepositoryAggregate | null> {
    const found = await this.prisma.repository.findFirst({
      where: { url, deleted_at: null },
    });
    return found ? RepositoryMapper.toDomain(found) : null;
  }

  async delete(id: string, deletedBy?: string): Promise<void> {
    await this.prisma.repository.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id: deletedBy,
      },
    });
  }
}
