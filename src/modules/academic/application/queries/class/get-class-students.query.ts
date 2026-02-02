import { GetClassesQuery } from './get-classes.query';

export class GetClassStudentsQuery {
  constructor(
    public readonly classId: string,
    public readonly query: GetClassesQuery,
  ) {}
}
