import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCourseByIdQuery } from '../../queries/course/get-course-by-id.query';
import { ICourseRepository } from '../../../domain/repositories/course.repository';
import { CourseAggregate } from '../../../domain/aggregates/course.aggregate';

@QueryHandler(GetCourseByIdQuery)
export class GetCourseByIdHandler implements IQueryHandler<GetCourseByIdQuery> {
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(query: GetCourseByIdQuery): Promise<CourseAggregate> {
    const course = await this.courseRepository.findById(query.id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${query.id} not found`);
    }
    return course;
  }
}
