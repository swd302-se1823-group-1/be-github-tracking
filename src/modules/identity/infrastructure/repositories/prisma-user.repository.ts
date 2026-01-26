import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserMapper } from '../mappers/user.mapper';

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
      where: { email },
      include: { student: true, lecturer: true },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByProviderId(providerId: string): Promise<UserAggregate | null> {
    const user = await this.prisma.user.findFirst({
      where: { provider_id: providerId },
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
}
