import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserMapper } from '../mappers/user.mapper';
import { Prisma } from '@generated/prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: UserId): Promise<UserAggregate | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.toString() },
      include: { student: true, lecturer: true },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserAggregate | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
        deleted_at: null,
      },
      include: { student: true, lecturer: true },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByProviderId(providerId: string): Promise<UserAggregate | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        provider_id: providerId,
        deleted_at: null,
      },
      include: { student: true, lecturer: true },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async create(user: UserAggregate): Promise<UserAggregate> {
    const persistence = UserMapper.toPersistence(user);

    // No manual transaction - managed by @Transactional() decorator
    await this.prisma.user.create({ data: persistence.user });

    if (persistence.student) {
      await this.prisma.student.create({
        data: persistence.student,
      });
    }

    if (persistence.lecturer) {
      await this.prisma.lecturer.create({
        data: persistence.lecturer,
      });
    }

    return user;
  }

  async update(user: UserAggregate): Promise<UserAggregate> {
    const persistence = UserMapper.toPersistence(user);

    // No manual transaction - managed by @Transactional() decorator
    await this.prisma.user.update({
      where: { id: user.id.toString() },
      data: persistence.user,
    });

    if (persistence.student) {
      await this.prisma.student.upsert({
        where: { id: user.id.toString() },
        create: persistence.student,
        update: {
          ...persistence.student,
          created_by_id: undefined,
        },
      });
    }

    if (persistence.lecturer) {
      await this.prisma.lecturer.upsert({
        where: { id: user.id.toString() },
        create: persistence.lecturer,
        update: {
          ...persistence.lecturer,
          created_by_id: undefined,
        },
      });
    }

    return user;
  }

  async findAll(params: {
    cursor?: string;
    take: number;
    order: 'ASC' | 'DESC';
    searchEmail?: string;
    role?: UserRole;
    isActive?: boolean;
  }): Promise<{
    users: UserAggregate[];
    nextCursor: string | null;
    total: number;
  }> {
    const { cursor, take, order, searchEmail, role, isActive } = params;

    const where: Prisma.UserWhereInput = {};

    if (searchEmail) {
      where.email = { contains: searchEmail, mode: 'insensitive' };
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        take: take + 1, // Fetch one extra to determine next cursor
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { created_at: order.toLowerCase() as 'asc' | 'desc' },
        include: { student: true, lecturer: true },
      }),
    ]);

    let nextCursor: string | null = null;
    if (users.length > take) {
      const nextItem = users.pop(); // Remove the extra item
      nextCursor = nextItem?.id || null;
    }

    return {
      users: users.map((u) => UserMapper.toDomain(u)),
      nextCursor,
      total,
    };
  }
}
