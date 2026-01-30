import { Body, Controller, Post, Patch, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateAdminDto } from '@/modules/identity/presentation/dtos/admin/create-admin.dto';
import { AdminResponseDto } from '@/modules/identity/presentation/dtos/admin/admin-response.dto';
import { UpdateAdminDto } from '@/modules/identity/presentation/dtos/admin/update-admin.dto';
import { CreateAdminCommand } from '@/modules/identity/application/commands/admin/create-admin.command';
import { UpdateAdminCommand } from '@/modules/identity/application/commands/admin/update-admin.command';
import { UserAggregate } from '@/modules/identity/domain/aggregates/user.aggregate';
import { ActiveUser, ResponseMessage, Roles } from '@/shared';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

@ApiTags('Identity/admins')
@Controller('admins')
export class AdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @Roles(UserRole.SUPERADMIN)
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

  @Patch('me')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current admin profile' })
  @ResponseMessage('Update profile successfully')
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: AdminResponseDto,
  })
  async updateMe(
    @Body() dto: UpdateAdminDto,
    @ActiveUser('id') userId: string,
  ): Promise<AdminResponseDto> {
    const user = await this.commandBus.execute<
      UpdateAdminCommand,
      UserAggregate
    >(new UpdateAdminCommand(userId, userId, dto.fullName));

    return new AdminResponseDto({
      id: user.id.toString(),
      email: user.email,
      fullName: user.fullName || '',
      avatarUrl: user.avatarUrl || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  @Patch(':id')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update admin profile by ID' })
  @ResponseMessage('Update admin successfully')
  @ApiResponse({
    status: 200,
    description: 'Admin updated successfully',
    type: AdminResponseDto,
  })
  async updateOne(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
    @ActiveUser('id') editorId: string,
  ): Promise<AdminResponseDto> {
    const user = await this.commandBus.execute<
      UpdateAdminCommand,
      UserAggregate
    >(new UpdateAdminCommand(id, editorId, dto.fullName));

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
