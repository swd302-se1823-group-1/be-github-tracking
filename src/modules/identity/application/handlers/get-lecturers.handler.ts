import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetLecturersQuery } from '../queries/get-lecturers.query';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { LecturerResponseDto } from '../../presentation/dtos/lecturer-response.dto';
import { CursorPageMetaDto } from '@/shared/dtos/cursor-page-meta.dto';
import { UserRole } from '../../domain/enums/user-role.enum';

@QueryHandler(GetLecturersQuery)
export class GetLecturersHandler implements IQueryHandler<GetLecturersQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: GetLecturersQuery,
  ): Promise<CursorPageDto<LecturerResponseDto>> {
    const { cursor, take, order, searchEmail, isActive } = query;

    const { users, nextCursor, total } = await this.userRepository.findAll({
      cursor,
      take,
      order,
      searchEmail,
      role: UserRole.LECTURER,
      isActive,
    });

    const lecturerDtos = users.map(
      (user) =>
        new LecturerResponseDto({
          id: user.id.toString(),
          email: user.email,
          fullName: user.fullName || '',
          avatarUrl: user.avatarUrl,
          employeeCode: user.lecturerProfile?.employeeCode || null,
          degree: user.lecturerProfile?.degree || null,
          department: user.lecturerProfile?.department || null,
          phoneNumber: user.lecturerProfile?.phoneNumber || null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }),
    );

    const meta = new CursorPageMetaDto({
      total,
      nextCursor,
      hasNextPage: !!nextCursor,
    });

    return new CursorPageDto(lecturerDtos, meta);
  }
}
