import { SemesterAggregate } from '../aggregates/semester.aggregate';

import { GetSemestersQuery } from '../../application/queries/semester/get-semesters.query';

export interface ISemesterRepository {
  create(semester: SemesterAggregate): Promise<SemesterAggregate>;
  findAll(query: GetSemestersQuery): Promise<{
    semesters: SemesterAggregate[];
    total: number;
    nextCursor: string | null;
  }>;
  findById(id: string): Promise<SemesterAggregate | null>;
  update(semester: SemesterAggregate): Promise<SemesterAggregate>;
  findByCode(code: string): Promise<SemesterAggregate | null>;
  delete(id: bigint, deletedBy: string): Promise<void>;
}

export const ISemesterRepository = Symbol('ISemesterRepository');
