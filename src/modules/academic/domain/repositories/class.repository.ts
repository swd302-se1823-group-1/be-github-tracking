import { ClassAggregate } from '../aggregates/class.aggregate';

export interface IClassRepository {
  create(clazz: ClassAggregate): Promise<ClassAggregate>;
}

export const IClassRepository = Symbol('IClassRepository');
