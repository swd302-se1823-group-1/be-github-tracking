import { GetSemestersDto } from '@/modules/academic/presentation/dtos/semester/get-semesters.dto';

export class GetSemestersQuery {
  constructor(
    public readonly cursor?: string,
    public readonly take?: number,
    public readonly order?: 'ASC' | 'DESC',
    public readonly search?: string,
    public readonly isActive?: boolean,
  ) {}

  static fromDto(dto: GetSemestersDto): GetSemestersQuery {
    return new GetSemestersQuery(
      dto.cursor,
      dto.take,
      dto.order,
      dto.search,
      dto.isActive,
    );
  }
}
