import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserMapper } from '../mappers/user.mapper';
import { UserRole } from '../../domain/enums/user-role.enum';

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
    const data = {
      id: user.id.toString(),
      email: user.email,
      full_name: user.fullName || null,
      avatar_url: user.avatarUrl || null,
      provider: user.provider || null,
      provider_id: user.providerId || null,
      role: user.role,
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };

    // No manual transaction - managed by @Transactional() decorator
    await this.prisma.user.create({ data });

    if (user.role === UserRole.STUDENT && user.studentProfile) {
      await this.prisma.student.create({
        data: {
          id: user.id.toString(),
          student_code: user.studentProfile.studentCode,
          university_email: user.studentProfile.universityEmail,
        },
      });
    }

    if (user.role === UserRole.LECTURER && user.lecturerProfile) {
      await this.prisma.lecturer.create({
        data: {
          id: user.id.toString(),
          employee_code: user.lecturerProfile.employeeCode,
          degree: user.lecturerProfile.degree,
          department: user.lecturerProfile.department,
          phone_number: user.lecturerProfile.phoneNumber,
        },
      });
    }

    return user;
  }

  async update(user: UserAggregate): Promise<void> {
    const data = {
      full_name: user.fullName || null,
      avatar_url: user.avatarUrl || null,
      provider: user.provider || null,
      provider_id: user.providerId || null,
      role: user.role,
      is_active: user.isActive,
      updated_at: user.updatedAt,
    };

    // No manual transaction - managed by @Transactional() decorator
    await this.prisma.user.update({
      where: { id: user.id.toString() },
      data,
    });

    if (user.role === UserRole.STUDENT && user.studentProfile) {
      await this.prisma.student.upsert({
        where: { id: user.id.toString() },
        create: {
          id: user.id.toString(),
          student_code: user.studentProfile.studentCode,
          university_email: user.studentProfile.universityEmail,
        },
        update: {
          student_code: user.studentProfile.studentCode,
          university_email: user.studentProfile.universityEmail,
        },
      });
    }

    if (user.role === UserRole.LECTURER && user.lecturerProfile) {
      await this.prisma.lecturer.upsert({
        where: { id: user.id.toString() },
        create: {
          id: user.id.toString(),
          employee_code: user.lecturerProfile.employeeCode,
          degree: user.lecturerProfile.degree,
          department: user.lecturerProfile.department,
          phone_number: user.lecturerProfile.phoneNumber,
        },
        update: {
          employee_code: user.lecturerProfile.employeeCode,
          degree: user.lecturerProfile.degree,
          department: user.lecturerProfile.department,
          phone_number: user.lecturerProfile.phoneNumber,
        },
      });
    }
  }
}
