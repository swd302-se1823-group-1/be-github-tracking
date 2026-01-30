import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetSemesterByIdQuery } from '../../queries/semester/get-semester-by-id.query';
import { ISemesterRepository } from '../../../domain/repositories/semester.repository';
import { SemesterAggregate } from '../../../domain/aggregates/semester.aggregate';

@QueryHandler(GetSemesterByIdQuery)
export class GetSemesterByIdHandler implements IQueryHandler<GetSemesterByIdQuery> {
  constructor(
    @Inject(ISemesterRepository)
    private readonly semesterRepository: ISemesterRepository,
  ) {}

  async execute(query: GetSemesterByIdQuery): Promise<SemesterAggregate> {
    const semester = await this.semesterRepository.findById(query.id);
    if (!semester) {
      throw new NotFoundException(`Semester with ID ${query.id} not found`);
    }
    return semester;
  }
}
