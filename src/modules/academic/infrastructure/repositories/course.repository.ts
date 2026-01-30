import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { ICourseRepository } from '../../domain/repositories/course.repository';
import { CourseAggregate } from '../../domain/aggregates/course.aggregate';
import { CourseMapper } from '../mappers/course.mapper';
import { Prisma } from '@generated/prisma/client';
import { GetCoursesQuery } from '../../application/queries/course/get-courses.query';

@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(course: CourseAggregate): Promise<CourseAggregate> {
    const persistence = CourseMapper.toPersistence(course);
    const newCourse = await this.prisma.course.create({
      data: persistence,
    });
    return CourseMapper.toDomain(newCourse);
  }

  async findAll(query: GetCoursesQuery): Promise<{
    courses: CourseAggregate[];
    total: number;
    nextCursor: string | null;
  }> {
    const { cursor, take = 10, search, order = 'DESC' } = query;

    const where: Prisma.CourseWhereInput = {
      deleted_at: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, courses] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        take: take ? take + 1 : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { id: order === 'ASC' ? 'asc' : 'desc' },
        skip: cursor ? 1 : 0,
      }),
    ]);

    let nextCursor: string | null = null;
    if (courses.length > take) {
      const nextItem = courses.pop();
      nextCursor = nextItem?.id ? nextItem.id : null;
    }

    return {
      courses: courses.map((c) => CourseMapper.toDomain(c)),
      total,
      nextCursor,
    };
  }

  async findById(id: string): Promise<CourseAggregate | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });
    return course ? CourseMapper.toDomain(course) : null;
  }

  async findByCode(code: string): Promise<CourseAggregate | null> {
    const course = await this.prisma.course.findUnique({
      where: { code, deleted_at: null },
    });
    return course ? CourseMapper.toDomain(course) : null;
  }
}
