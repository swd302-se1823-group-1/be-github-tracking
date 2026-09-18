import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCourseByCodeQuery } from '../../queries/course/get-course-by-code.query';
import { ICourseRepository } from '../../../domain/repositories/course.repository';
import { CourseAggregate } from '../../../domain/aggregates/course.aggregate';

@QueryHandler(GetCourseByCodeQuery)
export class GetCourseByCodeHandler implements IQueryHandler<GetCourseByCodeQuery> {
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(query: GetCourseByCodeQuery): Promise<CourseAggregate> {
    const course = await this.courseRepository.findByCode(query.code);
    if (!course) {
      throw new NotFoundException(`Course with code ${query.code} not found`);
    }
    return course;
  }
}
