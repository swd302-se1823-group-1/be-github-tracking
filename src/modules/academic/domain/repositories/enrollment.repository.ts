import { EnrollmentAggregate } from '../aggregates/enrollment.aggregate';

export interface IEnrollmentRepository {
  create(enrollment: EnrollmentAggregate): Promise<EnrollmentAggregate>;
  exists(classId: string, studentId: string): Promise<boolean>;
}

export const IEnrollmentRepository = Symbol('IEnrollmentRepository');
