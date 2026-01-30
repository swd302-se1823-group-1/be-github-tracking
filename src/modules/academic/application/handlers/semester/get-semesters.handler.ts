import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ISemesterRepository } from '@/modules/academic/domain/repositories/semester.repository';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { CursorPageMetaDto } from '@/shared/dtos/cursor-page-meta.dto';
import { GetSemestersQuery } from '../../queries/semester/get-semesters.query';
import { SemesterResponseDto } from '@/modules/academic/presentation/dtos/semester/semester-response.dto';

@QueryHandler(GetSemestersQuery)
export class GetSemestersHandler implements IQueryHandler<GetSemestersQuery> {
  constructor(
    @Inject(ISemesterRepository)
    private readonly semesterRepository: ISemesterRepository,
  ) {}

  async execute(
    query: GetSemestersQuery,
  ): Promise<CursorPageDto<SemesterResponseDto>> {
    const { semesters, total, nextCursor } =
      await this.semesterRepository.findAll(query);

    const dtos = semesters.map((semester) => new SemesterResponseDto(semester));

    const meta = new CursorPageMetaDto({
      total,
      nextCursor,
      hasNextPage: !!nextCursor,
    });

    return new CursorPageDto(dtos, meta);
  }
}
