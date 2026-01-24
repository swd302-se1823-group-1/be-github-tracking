import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/aggregates/user.aggregate';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByProviderId(providerId: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { provider_id: providerId },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async create(user: User): Promise<User> {
    // In strict DDD, 'create' in repository might just be 'save'.
    // But since we pass a User aggregate (which has an ID), we can implement it as create.

    // Map Aggregate properties to Prisma data
    const persistenceData = UserMapper.toPersistence(user);

    // We only need the fields relevant for creation, usually excluding 'id' if DB generates it,
    // BUT our Aggregate 'User' HAS 'id' (UUID).
    // If Domain generates ID, we pass it. If DB generates, we update Aggregate?
    // Best practice: Domain generates ID (UUID).

    const created = await this.prisma.user.create({
      data: {
        id: persistenceData.id,
        email: persistenceData.email,
        full_name: persistenceData.full_name,
        avatar_url: persistenceData.avatar_url,
        provider: persistenceData.provider,
        provider_id: persistenceData.provider_id,
        role: persistenceData.role, // Use the mapped role
        is_active: persistenceData.is_active,
        created_at: persistenceData.created_at,
        updated_at: persistenceData.updated_at,
      },
    });

    return UserMapper.toDomain(created);
  }

  async update(user: User): Promise<void> {
    const persistenceData = UserMapper.toPersistence(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        full_name: persistenceData.full_name,
        avatar_url: persistenceData.avatar_url,
        provider: persistenceData.provider,
        provider_id: persistenceData.provider_id,
        role: persistenceData.role,
        is_active: persistenceData.is_active,
        // updated_at is auto-updated by Prisma usually, or we set it explicitly from Aggregate
        updated_at: persistenceData.updated_at,
      },
    });
  }
}
