import {
  Controller,
  Get,
  Query,
  Put,
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
import { GetUsersDto } from '../dtos/user/get-users.dto';
import { UserResponseDto } from '../dtos/user/user-response.dto';
import { GetUsersQuery } from '../../application/queries/user/get-users.query';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { ResponseMessage, Roles, ActiveUser } from '@/shared';
import { UserRole } from '../../domain/enums/user-role.enum';
import { CloudinaryService } from '@/shared/cloudinary/cloudinary.service';
import type { UploadedFile as UploadedFileType } from '@/shared/types/uploaded-file.interface';
import { UploadAvatarResponseDto } from '@/shared/cloudinary/dtos/upload-avatar-response.dto';
import { UpdateUserAvatarCommand } from '../../application/commands/user/update-user-avatar.command';
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
}
