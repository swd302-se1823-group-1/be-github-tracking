import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCoursesQuery } from '../../queries/course/get-courses.query';
import { ICourseRepository } from '../../../domain/repositories/course.repository';
import { CourseAggregate } from '../../../domain/aggregates/course.aggregate';

@QueryHandler(GetCoursesQuery)
export class GetCoursesHandler implements IQueryHandler<GetCoursesQuery> {
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(query: GetCoursesQuery): Promise<{
    courses: CourseAggregate[];
    total: number;
    nextCursor: string | null;
  }> {
    return this.courseRepository.findAll(query);
  }
}
