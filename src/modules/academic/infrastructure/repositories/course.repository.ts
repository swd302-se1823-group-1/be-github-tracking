import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { ICourseRepository } from '../../domain/repositories/course.repository';
import { CourseAggregate } from '../../domain/aggregates/course.aggregate';
import { CourseMapper } from '../mappers/course.mapper';

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
}
