import {
  Controller,
  Get,
  Query,
  Put,
  Patch,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { GetUsersDto } from '@/modules/identity/presentation/dtos/user/get-users.dto';
import { UserResponseDto } from '@/modules/identity/presentation/dtos/user/user-response.dto';
import { GetUsersQuery } from '@/modules/identity/application/queries/user/get-users.query';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { ResponseMessage, Roles, ActiveUser } from '@/shared';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { CloudinaryService } from '@/shared/cloudinary/cloudinary.service';
import type { UploadedFile as UploadedFileType } from '@/shared/types/uploaded-file.interface';
import { UploadAvatarResponseDto } from '@/shared/cloudinary/dtos/upload-avatar-response.dto';
import { UpdateUserAvatarCommand } from '@/modules/identity/application/commands/user/update-user-avatar.command';
import { DeleteUserCommand } from '@/modules/identity/application/commands/user/delete-user.command';
import { BanUserCommand } from '@/modules/identity/application/commands/user/ban-user.command';
import { UnbanUserCommand } from '@/modules/identity/application/commands/user/unban-user.command';
import { CustomImageValidator } from './validators/custom-image.validator';

@ApiTags('Identity')
@Controller('users')
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  @Put('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    type: UploadAvatarResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ResponseMessage('Avatar uploaded successfully')
  async uploadAvatar(
    @ActiveUser('id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new CustomImageValidator(),
        ],
      }),
    )
    file: UploadedFileType,
  ): Promise<UploadAvatarResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadAvatar(
      file,
      userId,
    );

    // Update user avatar URL in database
    await this.commandBus.execute(
      new UpdateUserAvatarCommand(userId, uploadResult.url, userId),
    );

    return new UploadAvatarResponseDto(uploadResult);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ResponseMessage('User deleted successfully')
  async deleteUser(
    @Param('id') id: string,
    @ActiveUser('id') deletedById: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(id, deletedById));
  }

  @Patch(':id/ban')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Ban a user' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  @ResponseMessage('User banned successfully')
  async banUser(
    @Param('id') id: string,
    @ActiveUser('id') bannedById: string,
  ): Promise<void> {
    await this.commandBus.execute(new BanUserCommand(id, bannedById));
  }

  @Patch(':id/unban')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Unban a user' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  @ResponseMessage('User unbanned successfully')
  async unbanUser(
    @Param('id') id: string,
    @ActiveUser('id') unbannedById: string,
  ): Promise<void> {
    await this.commandBus.execute(new UnbanUserCommand(id, unbannedById));
  }
}
