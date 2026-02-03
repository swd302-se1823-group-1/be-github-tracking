import {
  Body,
  Controller,
  Param,
  Post,
  Patch,
  Delete,
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
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ActiveUser, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

import { AddProjectMemberDto } from '@/modules/academic/presentation/dtos/project/add-project-member.dto';
import { AddProjectMemberCommand } from '@/modules/academic/application/commands/project/add-project-member.command';
import { UpdateProjectDto } from '@/modules/academic/presentation/dtos/project/update-project.dto';
import { UpdateProjectCommand } from '@/modules/academic/application/commands/project/update-project.command';
import { DeleteProjectCommand } from '@/modules/academic/application/commands/project/delete-project.command';
import { UpdateProjectAvatarCommand } from '@/modules/academic/application/commands/project/update-project-avatar.command';
import { ProjectResponseDto } from '@/modules/academic/presentation/dtos/project/project-response.dto';
import { ProjectAggregate } from '@/modules/academic/domain/aggregates/project.aggregate';
import { CloudinaryService } from '@/shared/cloudinary/cloudinary.service';
import type { UploadedFile as UploadedFileType } from '@/shared/types/uploaded-file.interface';
import { UploadAvatarResponseDto } from '@/shared/cloudinary/dtos/upload-avatar-response.dto';
import { CustomImageValidator } from '@/modules/identity/presentation/http/validators/custom-image.validator';

@ApiTags('Academic/projects')
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post(':id/members')
  @Roles(UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT) // Student can add member if Leader? Logic inside handler? Handler didn't check role. Assuming LECTURER/ADMIN for now safely.
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a member to a project' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  async addMember(
    @Param('id') projectId: string,
    @Body() dto: AddProjectMemberDto,
    @ActiveUser() user: { id: string },
  ): Promise<void> {
    await this.commandBus.execute(
      new AddProjectMemberCommand(projectId, dto.studentId, dto.role, user.id),
    );
  }

  @Patch(':id')
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @ActiveUser('id') userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.commandBus.execute<
      UpdateProjectCommand,
      ProjectAggregate
    >(
      new UpdateProjectCommand(
        id,
        dto.name,
        dto.topic,
        dto.description,
        userId,
      ),
    );
    return new ProjectResponseDto(project);
  }

  @Put(':id/avatar')
  @Roles(UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Upload project avatar' })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    type: UploadAvatarResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadAvatar(
    @Param('id') projectId: string,
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

    // Upload to Cloudinary with project-specific folder
    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      `projects/${projectId}`,
    );

    // Update project avatar URL in database
    await this.commandBus.execute(
      new UpdateProjectAvatarCommand(projectId, uploadResult.url, userId),
    );

    return new UploadAvatarResponseDto(uploadResult);
  }

  @Delete(':id')
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project (Soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  async delete(
    @Param('id') id: string,
    @ActiveUser() user: { id: string },
  ): Promise<void> {
    await this.commandBus.execute(new DeleteProjectCommand(id, user.id));
  }
}
