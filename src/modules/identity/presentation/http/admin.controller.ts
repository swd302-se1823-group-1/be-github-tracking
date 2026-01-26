import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAdminDto } from '../dtos/create-admin.dto';
import { AdminResponseDto } from '../dtos/admin-response.dto';
import { CreateAdminCommand } from '../../application/commands/create-admin.command';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { ActiveUser, ResponseMessage, Roles } from '@/shared';
import { UserRole } from '../../domain/enums/user-role.enum';

@ApiTags('Identity/admins')
@Controller('admins')
export class AdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new Admin user' })
  @ResponseMessage('Admin created successfully')
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully',
    type: AdminResponseDto,
  })
  async create(
    @Body() dto: CreateAdminDto,
    @ActiveUser('id') userId: string,
  ): Promise<AdminResponseDto> {
    const user = await this.commandBus.execute<
      CreateAdminCommand,
      UserAggregate
    >(new CreateAdminCommand(dto.email, dto.fullName, dto.avatarUrl, userId));

    return new AdminResponseDto({
      id: user.id.toString(),
      email: user.email,
      fullName: user.fullName || '',
      avatarUrl: user.avatarUrl || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
