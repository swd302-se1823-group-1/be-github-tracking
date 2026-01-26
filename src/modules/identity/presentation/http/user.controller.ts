import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUsersDto } from '../dtos/user/get-users.dto';
import { UserResponseDto } from '../dtos/user/user-response.dto';
import { GetUsersQuery } from '../../application/queries/user/get-users.query';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { ResponseMessage, Roles } from '@/shared';
import { UserRole } from '../../domain/enums/user-role.enum';

@ApiTags('Identity')
@Controller('users')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all users with cursor pagination and filtering',
  })
  @ResponseMessage('Get users successfully')
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: CursorPageDto,
  })
  async getAll(
    @Query() dto: GetUsersDto,
  ): Promise<CursorPageDto<UserResponseDto>> {
    return this.queryBus.execute(
      new GetUsersQuery(
        dto.cursor,
        dto.take,
        dto.order,
        dto.searchEmail,
        dto.role,
        dto.isActive,
      ),
    );
  }
}
