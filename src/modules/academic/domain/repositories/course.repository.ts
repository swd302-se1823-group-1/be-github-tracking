import { CourseAggregate } from '../aggregates/course.aggregate';

import { GetCoursesQuery } from '../../application/queries/course/get-courses.query';

export interface ICourseRepository {
  create(course: CourseAggregate): Promise<CourseAggregate>;
  findAll(query: GetCoursesQuery): Promise<{
    courses: CourseAggregate[];
    total: number;
    nextCursor: string | null;
  }>;
  findById(id: string): Promise<CourseAggregate | null>;
  findByCode(code: string): Promise<CourseAggregate | null>;
}

export const ICourseRepository = Symbol('ICourseRepository');
