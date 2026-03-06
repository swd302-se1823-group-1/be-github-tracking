import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { IClassRepository } from '../../domain/repositories/class.repository';
import { ClassAggregate } from '../../domain/aggregates/class.aggregate';
import { ClassMapper } from '../mappers/class.mapper';
import { GetClassesQuery } from '../../application/queries/class/get-classes.query';
import { Prisma } from '@generated/prisma/client';
import { ClassWithRelations } from '../../domain/types/class-with-relations.type';
import { CourseMapper } from '../mappers/course.mapper';
import { SemesterMapper } from '../mappers/semester.mapper';

@Injectable()
export class PrismaClassRepository implements IClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(clazz: ClassAggregate): Promise<ClassAggregate> {
    const newClass = await this.prisma.class.create({
      data: ClassMapper.toPersistence(clazz),
    });
    return ClassMapper.toDomain(newClass);
  }

  async update(clazz: ClassAggregate): Promise<ClassAggregate> {
    const updated = await this.prisma.class.update({
      where: { id: clazz.id },
      data: ClassMapper.toUpdateData(clazz),
    });
    return ClassMapper.toDomain(updated);
  }

  async findAll(query: GetClassesQuery): Promise<{
    classes: ClassWithRelations[];
    total: number;
    nextCursor: string | null;
  }> {
    const { cursor, take = 10, search, order = 'DESC', courseCode } = query;

    const where: Prisma.ClassWhereInput = {
      deleted_at: null,
      ...(courseCode && {
        course: {
          code: courseCode,
        },
      }),
      ...(search && {
        OR: [
          { class_name: { contains: search, mode: 'insensitive' } },
          { class_code: { contains: search, mode: 'insensitive' } },
          {
            course: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
    };

    const [total, classes] = await Promise.all([
      this.prisma.class.count({ where }),
      this.prisma.class.findMany({
        where,
        take: take ? take + 1 : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updated_at: order === 'ASC' ? 'asc' : 'desc' },
        skip: cursor ? 1 : 0,
        include: {
          lecturer: {
            include: { user: true },
          },
          course: true,
          semester: true,
        },
      }),
    ]);

    let nextCursor: string | null = null;
    if (classes.length > take) {
      const nextItem = classes.pop();
      nextCursor = nextItem?.id ? nextItem.id : null;
    }

    const domainClasses = classes.map((c) => {
      const aggregate = ClassMapper.toDomain(c) as ClassWithRelations;
      // Attach extra properties
      aggregate.lecturer = c.lecturer; // Lecturer is likely complex or not fully aggregated yet
      aggregate.course = c.course ? CourseMapper.toDomain(c.course) : undefined;
      aggregate.semester = c.semester
        ? SemesterMapper.toDomain(c.semester)
        : undefined;
      return aggregate;
    });

    return {
      classes: domainClasses,
      total,
      nextCursor,
    };
  }
  async findById(id: string): Promise<ClassAggregate | null> {
    const found = await this.prisma.class.findUnique({
      where: { id, deleted_at: null },
    });
    return found ? ClassMapper.toDomain(found) : null;
  }

  async findEnrolledClasses(
    studentId: string,
    query: GetClassesQuery,
  ): Promise<{
    classes: ClassWithRelations[];
    total: number;
    nextCursor: string | null;
  }> {
    const { cursor, take = 10, search, order = 'DESC', courseCode } = query;

    const where: Prisma.ClassWhereInput = {
      deleted_at: null,
      enrollments: {
        some: {
          student_id: studentId,
          deleted_at: null,
        },
      },
      ...(courseCode && {
        course: {
          code: courseCode,
        },
      }),
      ...(search && {
        OR: [
          { class_name: { contains: search, mode: 'insensitive' } },
          { class_code: { contains: search, mode: 'insensitive' } },
          {
            course: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
    };

    const [total, classes] = await Promise.all([
      this.prisma.class.count({ where }),
      this.prisma.class.findMany({
        where,
        take: take ? take + 1 : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updated_at: order === 'ASC' ? 'asc' : 'desc' },
        skip: cursor ? 1 : 0,
        include: {
          lecturer: {
            include: { user: true },
          },
          course: true,
          semester: true,
        },
      }),
    ]);

    let nextCursor: string | null = null;
    if (classes.length > take) {
      const nextItem = classes.pop();
      nextCursor = nextItem?.id ? nextItem.id : null;
    }

    const domainClasses = classes.map((c) => {
      const aggregate = ClassMapper.toDomain(c) as ClassWithRelations;
      aggregate.lecturer = c.lecturer;
      aggregate.course = c.course ? CourseMapper.toDomain(c.course) : undefined;
      aggregate.semester = c.semester
        ? SemesterMapper.toDomain(c.semester)
        : undefined;
      return aggregate;
    });

    return {
      classes: domainClasses,
      total,
      nextCursor,
    };
  }

  async findByIdWithRelations(id: string): Promise<ClassWithRelations | null> {
    const found = await this.prisma.class.findUnique({
      where: { id, deleted_at: null },
      include: {
        lecturer: {
          include: { user: true },
        },
        course: true,
        semester: true,
      },
    });

    if (!found) return null;

    const aggregate = ClassMapper.toDomain(found) as ClassWithRelations;
    aggregate.lecturer = found.lecturer;
    aggregate.course = found.course
      ? CourseMapper.toDomain(found.course)
      : undefined;
    aggregate.semester = found.semester
      ? SemesterMapper.toDomain(found.semester)
      : undefined;

    return aggregate;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.class.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id: deletedBy,
      },
    });
  }

  async countActiveEnrollments(id: string): Promise<number> {
    return this.prisma.enrollment.count({
      where: {
        class_id: id,
        deleted_at: null,
      },
    });
  }
}
