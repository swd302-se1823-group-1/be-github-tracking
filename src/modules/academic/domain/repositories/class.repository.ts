import { ClassAggregate } from '../aggregates/class.aggregate';

import { GetClassesQuery } from '../../application/queries/class/get-classes.query';

import { ClassWithRelations } from '../types/class-with-relations.type';

export interface IClassRepository {
  create(clazz: ClassAggregate): Promise<ClassAggregate>;
  findAll(query: GetClassesQuery): Promise<{
    classes: ClassWithRelations[];
    total: number;
    nextCursor: string | null;
  }>;
  findById(id: string): Promise<ClassAggregate | null>;
}

export const IClassRepository = Symbol('IClassRepository');
