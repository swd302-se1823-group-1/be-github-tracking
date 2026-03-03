import { RepositoryAggregate } from '../aggregates/repository.aggregate';

export interface IRepositoryRepository {
  create(repository: RepositoryAggregate): Promise<RepositoryAggregate>;
  update(repository: RepositoryAggregate): Promise<RepositoryAggregate>;
  findById(id: string): Promise<RepositoryAggregate | null>;
  findByProjectId(projectId: string): Promise<RepositoryAggregate[]>;
  findByUrl(url: string): Promise<RepositoryAggregate | null>;
  delete(id: string, deletedBy?: string): Promise<void>;
}

export const IRepositoryRepository = Symbol('IRepositoryRepository');
