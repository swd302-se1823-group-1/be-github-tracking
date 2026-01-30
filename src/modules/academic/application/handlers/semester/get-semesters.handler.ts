import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SemesterAggregate } from '@/modules/academic/domain/aggregates/semester.aggregate';
import { GetSemestersQuery } from '../../queries/semester/get-semesters.query';
import { ISemesterRepository } from '@/modules/academic/domain/repositories/semester.repository';

@QueryHandler(GetSemestersQuery)
export class GetSemestersHandler implements IQueryHandler<GetSemestersQuery> {
  constructor(
    @Inject(ISemesterRepository)
    private readonly semesterRepository: ISemesterRepository,
  ) {}

  async execute(query: GetSemestersQuery): Promise<{
    semesters: SemesterAggregate[];
    total: number;
    nextCursor: string | null;
  }> {
    return this.semesterRepository.findAll(query);
  }
}
