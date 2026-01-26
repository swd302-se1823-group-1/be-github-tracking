import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetStudentsQuery } from '@/modules/identity/application/queries/student/get-students.query';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';

import { CursorPageMetaDto } from '@/shared/dtos/cursor-page-meta.dto';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { StudentResponseDto } from '@/modules/identity/presentation/dtos/student/student-response.dto';

@QueryHandler(GetStudentsQuery)
export class GetStudentsHandler implements IQueryHandler<GetStudentsQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: GetStudentsQuery,
  ): Promise<CursorPageDto<StudentResponseDto>> {
    const { cursor, take, order, searchEmail, isActive } = query;

    const { users, nextCursor, total } = await this.userRepository.findAll({
      cursor,
      take,
      order,
      searchEmail,
      role: UserRole.STUDENT,
      isActive,
    });

    const studentDtos = users.map(
      (user) =>
        new StudentResponseDto({
          id: user.id.toString(),
          email: user.email,
          fullName: user.fullName || '',
          avatarUrl: user.avatarUrl,
          studentCode: user.studentProfile?.studentCode || null,
          universityEmail: user.studentProfile?.universityEmail || null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }),
    );

    const meta = new CursorPageMetaDto({
      total,
      nextCursor,
      hasNextPage: !!nextCursor,
    });

    return new CursorPageDto(studentDtos, meta);
  }
}
