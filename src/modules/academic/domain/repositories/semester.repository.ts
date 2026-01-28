import { SemesterAggregate } from '../aggregates/semester.aggregate';

export interface ISemesterRepository {
  create(semester: SemesterAggregate): Promise<SemesterAggregate>;
}

export const ISemesterRepository = Symbol('ISemesterRepository');
