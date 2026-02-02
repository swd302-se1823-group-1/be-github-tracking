import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClassByIdQuery } from '../../queries/class/get-class-by-id.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { IClassRepository } from '@/modules/academic/domain/repositories/class.repository';
import { ClassWithRelations } from '@/modules/academic/domain/types/class-with-relations.type';

@QueryHandler(GetClassByIdQuery)
export class GetClassByIdHandler implements IQueryHandler<GetClassByIdQuery> {
  constructor(
    @Inject(IClassRepository)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute(query: GetClassByIdQuery): Promise<ClassWithRelations> {
    const { id } = query;
    const clazz = await this.classRepository.findByIdWithRelations(id);
    if (!clazz) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return clazz;
  }
}
