import { GetCoursesDto } from '@/modules/academic/presentation/dtos/course/get-courses.dto';

export class GetCoursesQuery {
  constructor(
    public readonly cursor?: string,
    public readonly take?: number,
    public readonly order?: 'ASC' | 'DESC',
    public readonly search?: string,
  ) {}

  static fromDto(dto: GetCoursesDto): GetCoursesQuery {
    return new GetCoursesQuery(dto.cursor, dto.take, dto.order, dto.search);
  }
}
