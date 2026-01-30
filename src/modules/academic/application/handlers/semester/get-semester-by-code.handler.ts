import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetSemesterByCodeQuery } from '../../queries/semester/get-semester-by-code.query';
import { ISemesterRepository } from '../../../domain/repositories/semester.repository';
import { SemesterAggregate } from '../../../domain/aggregates/semester.aggregate';

@QueryHandler(GetSemesterByCodeQuery)
export class GetSemesterByCodeHandler implements IQueryHandler<GetSemesterByCodeQuery> {
  constructor(
    @Inject(ISemesterRepository)
    private readonly semesterRepository: ISemesterRepository,
  ) {}

  async execute(query: GetSemesterByCodeQuery): Promise<SemesterAggregate> {
    const semester = await this.semesterRepository.findByCode(query.code);
    if (!semester) {
      throw new NotFoundException(`Semester with code ${query.code} not found`);
    }
    return semester;
  }
}
