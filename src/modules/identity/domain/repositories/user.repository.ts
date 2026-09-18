import { UserAggregate } from '../aggregates/user.aggregate';
import { UserId } from '../value-objects/user-id.vo';

export interface IUserRepository {
  findById(id: UserId): Promise<UserAggregate | null>;
  findByEmail(email: string): Promise<UserAggregate | null>;
  findByProviderId(providerId: string): Promise<UserAggregate | null>;
  create(user: UserAggregate): Promise<UserAggregate>;
  update(user: UserAggregate): Promise<UserAggregate>;
  findAll(params: any): Promise<{
    users: UserAggregate[];
    nextCursor: string | null;
    total: number;
  }>;
}

export const IUserRepository = Symbol('IUserRepository');
