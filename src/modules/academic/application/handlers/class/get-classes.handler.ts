import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IClassRepository } from '@/modules/academic/domain/repositories/class.repository';
import { GetClassesQuery } from '@/modules/academic/application/queries/class/get-classes.query';

import { ClassWithRelations } from '@/modules/academic/domain/types/class-with-relations.type';

@QueryHandler(GetClassesQuery)
export class GetClassesHandler implements IQueryHandler<GetClassesQuery> {
  constructor(
    @Inject(IClassRepository)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute(query: GetClassesQuery): Promise<{
    classes: ClassWithRelations[];
    total: number;
    nextCursor: string | null;
  }> {
    return this.classRepository.findAll(query);
  }
}
