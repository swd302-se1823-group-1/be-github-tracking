import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsersQuery } from '../queries/get-users.query';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { UserResponseDto } from '../../presentation/dtos/user-response.dto';
import { CursorPageMetaDto } from '@/shared/dtos/cursor-page-meta.dto';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUsersQuery): Promise<CursorPageDto<UserResponseDto>> {
    const { cursor, take, order, searchEmail, role, isActive } = query;

    const { users, nextCursor, total } = await this.userRepository.findAll({
      cursor,
      take,
      order,
      searchEmail,
      role,
      isActive,
    });

    const userDtos = users.map(
      (user) =>
        new UserResponseDto({
          id: user.id.toString(),
          email: user.email,
          fullName: user.fullName || '',
          avatarUrl: user.avatarUrl,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }),
    );

    const meta = new CursorPageMetaDto({
      total,
      nextCursor,
      hasNextPage: !!nextCursor,
    });

    return new CursorPageDto(userDtos, meta);
  }
}
