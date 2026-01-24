import { User } from '../aggregates/user.aggregate';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByProviderId(providerId: string): Promise<User | null>;
  create(data: User): Promise<User>;
  update(user: User): Promise<void>;
}

export const IUserRepository = Symbol('IUserRepository');
