import { ClassAggregate } from '../aggregates/class.aggregate';
import { CourseAggregate } from '../aggregates/course.aggregate';
import { SemesterAggregate } from '../aggregates/semester.aggregate';

export type ClassWithRelations = ClassAggregate & {
  lecturer?: {
    id: string;
    // We can expand this if we have a LecturerAggregate, currently assuming minimal structure needed
    user?: {
      email: string;
      full_name: string | null;
    };
  };
  course?: CourseAggregate;
  semester?: SemesterAggregate;
};
