import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { IEnrollmentRepository } from '@/modules/academic/domain/repositories/enrollment.repository';
import { EnrollmentAggregate } from '@/modules/academic/domain/aggregates/enrollment.aggregate';
import { EnrollmentMapper } from '@/modules/academic/infrastructure/mappers/enrollment.mapper';
import { GetClassesQuery } from '@/modules/academic/application/queries/class/get-classes.query';
import { Prisma } from '@generated/prisma/client';

@Injectable()
export class PrismaEnrollmentRepository implements IEnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(enrollment: EnrollmentAggregate): Promise<EnrollmentAggregate> {
    const data = EnrollmentMapper.toPersistence(enrollment);

    const newEnrollment = await this.prisma.enrollment.create({
      data,
    });
    return EnrollmentMapper.toDomain(newEnrollment);
  }

  async exists(classId: string, studentId: string): Promise<boolean> {
    const count = await this.prisma.enrollment.count({
      where: {
        class_id: classId,
        student_id: studentId,
        deleted_at: null,
      },
    });
    return count > 0;
  }

  async findStudentsByClass(
    classId: string,
    query: GetClassesQuery,
  ): Promise<{
    students: any[];
    total: number;
    nextCursor: string | null;
  }> {
    const { cursor, take = 10, search } = query;

    const where: Prisma.EnrollmentWhereInput = {
      class_id: classId,
      deleted_at: null,
      ...(search && {
        student: {
          user: {
            OR: [
              { full_name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      }),
    };

    const [total, enrollments] = await Promise.all([
      this.prisma.enrollment.count({ where }),
      this.prisma.enrollment.findMany({
        where,
        take: take ? take + 1 : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { created_at: 'desc' },
        skip: cursor ? 1 : 0,
        include: {
          student: {
            include: { user: true },
          },
        },
      }),
    ]);

    let nextCursor: string | null = null;
    if (enrollments.length > take) {
      const nextItem = enrollments.pop();
      nextCursor = nextItem?.id ? nextItem.id : null;
    }

    const students = enrollments.map((e) => e.student);

    return {
      students,
      total,
      nextCursor,
    };
  }
}
