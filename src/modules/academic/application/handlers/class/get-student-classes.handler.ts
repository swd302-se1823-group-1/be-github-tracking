import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IClassRepository } from '@/modules/academic/domain/repositories/class.repository';
import { ClassWithRelations } from '@/modules/academic/domain/types/class-with-relations.type';
import { GetStudentClassesQuery } from '../../queries/class/get-student-classes.query';

@QueryHandler(GetStudentClassesQuery)
export class GetStudentClassesHandler implements IQueryHandler<GetStudentClassesQuery> {
  constructor(
    @Inject(IClassRepository)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute(query: GetStudentClassesQuery): Promise<{
    classes: ClassWithRelations[];
    total: number;
    nextCursor: string | null;
  }> {
    return this.classRepository.findEnrolledClasses(query.studentId, query);
  }
}
