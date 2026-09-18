import { GetClassesQuery } from './get-classes.query';

export class GetStudentClassesQuery extends GetClassesQuery {
  constructor(
    public readonly studentId: string,
    public readonly cursor?: string,
    public readonly take?: number,
    public readonly order?: 'ASC' | 'DESC',
    public readonly search?: string,
  ) {
    super(cursor, take, order, search);
  }
}
