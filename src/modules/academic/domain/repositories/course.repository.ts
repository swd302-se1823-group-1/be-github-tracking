import { CourseAggregate } from '../aggregates/course.aggregate';

export interface ICourseRepository {
  create(course: CourseAggregate): Promise<CourseAggregate>;
}

export const ICourseRepository = Symbol('ICourseRepository');
