import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClassStudentsQuery } from '../../queries/class/get-class-students.query';
import { Inject } from '@nestjs/common';
import { IEnrollmentRepository } from '@/modules/academic/domain/repositories/enrollment.repository';

@QueryHandler(GetClassStudentsQuery)
export class GetClassStudentsHandler implements IQueryHandler<GetClassStudentsQuery> {
  constructor(
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(query: GetClassStudentsQuery): Promise<{
    students: any[];
    total: number;
    nextCursor: string | null;
  }> {
    const { classId, query: paginationQuery } = query;
    return this.enrollmentRepository.findStudentsByClass(
      classId,
      paginationQuery,
    );
  }
}
