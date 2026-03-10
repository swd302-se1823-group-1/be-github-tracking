import {
  Body,
  Controller,
  Param,
  Post,
  Get,
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
import { TransferLeaderDto } from '@/modules/academic/presentation/dtos/project/transfer-leader.dto';
import { TransferLeaderCommand } from '@/modules/academic/application/commands/project/transfer-leader.command';
import { RemoveProjectMemberCommand } from '@/modules/academic/application/commands/project/remove-project-member.command';
import { LinkRepositoryCommand } from '@/modules/academic/application/commands/repository/link-repository.command';
import {
  ProjectResponseDto,
  ProjectMemberResponseDto,
} from '@/modules/academic/presentation/dtos/project/project-response.dto';
import { GetProjectMembersQuery } from '@/modules/academic/application/queries/project/get-project-members.query';
import { ProjectDtoMapper } from '@/modules/academic/presentation/mappers/project-dto.mapper';
import { LinkRepositoryRequestDto } from '@/modules/academic/presentation/dtos/project/request/link-repository.request.dto';
import { RepositoryResponseDto } from '@/modules/academic/presentation/dtos/project/response/repository-response.dto';
import { ProjectAggregate } from '@/modules/academic/domain/aggregates/project.aggregate';
import { ProjectMemberWithStudent } from '@/modules/academic/domain/repositories/project.repository';
import { CloudinaryService } from '@/shared/cloudinary/cloudinary.service';
import type { UploadedFile as UploadedFileType } from '@/shared/types/uploaded-file.interface';
import { UploadAvatarResponseDto } from '@/shared/cloudinary/dtos/upload-avatar-response.dto';
import { CustomImageValidator } from '@/modules/identity/presentation/http/validators/custom-image.validator';
import { Throttle } from '@nestjs/throttler';

import { GetProjectByIdQuery } from '@/modules/academic/application/queries/project/get-project-by-id.query';
import { GetMyProjectsQuery } from '@/modules/academic/application/queries/project/get-my-projects.query';
import { RepositoryAggregate } from '@/modules/academic/domain/aggregates/repository.aggregate';

// New Commands & Queries for Repository
import { DeleteRepositoryCommand } from '@/modules/academic/application/commands/repository/delete-repository.command';
import { GetRepositoriesByProjectQuery } from '@/modules/academic/application/queries/repository/get-repositories-by-project.query';
import { GetRepositoryByIdQuery } from '@/modules/academic/application/queries/repository/get-repository-by-id.query';

@ApiTags('Academic/projects')
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post(':id/members')
  @Roles(UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a member to a project' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  async addMember(
    @Param('id') projectId: string,
    @Body() dto: AddProjectMemberDto,
    @ActiveUser() user: { id: string },
  ): Promise<void> {
    await this.commandBus.execute(
      new AddProjectMemberCommand(projectId, dto.members, user.id),
    );
  }

  @Delete(':id/members/:studentId')
  @Roles(UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a member from a project' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove the project LEADER' })
  @ApiResponse({
    status: 403,
    description: 'Only the project LEADER can remove members',
  })
  @ApiResponse({ status: 404, description: 'Project or member not found' })
  async removeMember(
    @Param('id') projectId: string,
    @Param('studentId') studentId: string,
    @ActiveUser('id') requesterId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new RemoveProjectMemberCommand(projectId, studentId, requesterId),
    );
  }

  @Get(':id/members')
  @Roles(UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all members of a project' })
  @ApiResponse({
    status: 200,
    description: 'Members retrieved successfully',
    type: [ProjectMemberResponseDto],
  })
  async getMembers(
    @Param('id') projectId: string,
  ): Promise<ProjectMemberResponseDto[]> {
    const members = await this.queryBus.execute<
      GetProjectMembersQuery,
      ProjectMemberWithStudent[]
    >(new GetProjectMembersQuery(projectId));
    return members.map((m) => ProjectDtoMapper.toMemberResponseFromPrisma(m));
  }

  @Get('/me')
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my projects' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [ProjectResponseDto],
  })
  async getMyProjects(
    @ActiveUser('id') userId: string,
  ): Promise<ProjectResponseDto[]> {
    const projects = await this.queryBus.execute<
      GetMyProjectsQuery,
      ProjectAggregate[]
    >(new GetMyProjectsQuery(userId));
    return projects.map((p) => ProjectDtoMapper.toResponse(p));
  }

  @Get(':id')
  @Roles(UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: ProjectResponseDto,
  })
  async getById(
    @Param('id') projectId: string,
    @ActiveUser('id') userId: string,
  ): Promise<ProjectResponseDto> {
    return this.queryBus.execute<GetProjectByIdQuery, ProjectResponseDto>(
      new GetProjectByIdQuery(projectId, userId),
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

  @Put(':id/transfer-leader')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer project leadership to another member' })
  @ApiResponse({
    status: 200,
    description: 'Project leadership transferred successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'The specified member is already the leader',
  })
  @ApiResponse({
    status: 403,
    description: 'Only the current project LEADER can transfer leadership',
  })
  @ApiResponse({
    status: 404,
    description: 'Project or new leader member not found',
  })
  async transferLeader(
    @Param('id') projectId: string,
    @Body() dto: TransferLeaderDto,
    @ActiveUser('id') currentLeaderId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new TransferLeaderCommand(
        projectId,
        dto.newLeaderStudentId,
        currentLeaderId,
      ),
    );
  }

  @Post(':id/repositories')
  @Throttle({ medium: {} })
  @Roles(UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link a GitHub repository to a project' })
  @ApiResponse({
    status: 201,
    description: 'Repository linked successfully',
    type: RepositoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid GitHub URL' })
  @ApiResponse({
    status: 404,
    description: 'Project or GitHub repository not found/private',
  })
  @ApiResponse({ status: 409, description: 'Repository already linked' })
  async linkRepository(
    @Param('id') projectId: string,
    @Body() dto: LinkRepositoryRequestDto,
    @ActiveUser('id') userId: string,
  ): Promise<RepositoryResponseDto> {
    const aggregate = await this.commandBus.execute<
      LinkRepositoryCommand,
      RepositoryAggregate
    >(new LinkRepositoryCommand(projectId, dto.url, userId));
    return new RepositoryResponseDto(aggregate);
  }

  @Get(':id/repositories')
  @Roles(UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all repositories of a project' })
  @ApiResponse({
    status: 200,
    description: 'Repositories retrieved successfully',
    type: [RepositoryResponseDto],
  })
  async getRepositories(
    @Param('id') projectId: string,
    @ActiveUser('id') userId: string,
  ): Promise<RepositoryResponseDto[]> {
    const repositories = await this.queryBus.execute<
      GetRepositoriesByProjectQuery,
      RepositoryAggregate[]
    >(new GetRepositoriesByProjectQuery(projectId, userId));
    return repositories.map((repo) => new RepositoryResponseDto(repo));
  }

  @Get(':id/repositories/:repoId')
  @Roles(UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get repository details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Repository retrieved successfully',
    type: RepositoryResponseDto,
  })
  async getRepositoryById(
    @Param('id') projectId: string,
    @Param('repoId') repoId: string,
    @ActiveUser('id') userId: string,
  ): Promise<RepositoryResponseDto> {
    const repository = await this.queryBus.execute<
      GetRepositoryByIdQuery,
      RepositoryAggregate
    >(new GetRepositoryByIdQuery(repoId, projectId, userId));
    return new RepositoryResponseDto(repository);
  }

  @Delete(':id/repositories/:repoId')
  @Roles(UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink/Delete a project repository' })
  @ApiResponse({
    status: 200,
    description: 'Repository deleted successfully',
  })
  async deleteRepository(
    @Param('id') projectId: string,
    @Param('repoId') repoId: string,
    @ActiveUser('id') userId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteRepositoryCommand(repoId, projectId, userId),
    );
  }
}
