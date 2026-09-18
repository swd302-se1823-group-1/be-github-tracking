import { EnrollmentAggregate } from '../aggregates/enrollment.aggregate';
import { GetClassesQuery } from '@/modules/academic/application/queries/class/get-classes.query';

export interface IEnrollmentRepository {
  create(enrollment: EnrollmentAggregate): Promise<EnrollmentAggregate>;
  exists(classId: string, studentId: string): Promise<boolean>;
  findStudentsByClass(
    classId: string,
    query: GetClassesQuery,
  ): Promise<{
    students: any[]; // We will refine 'any' to a proper type like 'StudentWithRelations'
    total: number;
    nextCursor: string | null;
  }>;
}

export const IEnrollmentRepository = Symbol('IEnrollmentRepository');
