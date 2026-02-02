import { GetClassesDto } from '@/modules/academic/presentation/dtos/class/get-classes.dto';

export class GetClassesQuery {
  constructor(
    public readonly cursor?: string,
    public readonly take?: number,
    public readonly order?: 'ASC' | 'DESC',
    public readonly search?: string,
    public readonly courseCode?: string,
  ) {}

  static fromDto(dto: GetClassesDto): GetClassesQuery {
    return new GetClassesQuery(
      dto.cursor,
      dto.take,
      dto.order,
      dto.search,
      dto.courseCode,
    );
  }
}
