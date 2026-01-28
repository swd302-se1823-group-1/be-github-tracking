import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLecturerDto } from '@/modules/identity/presentation/dtos/lecturer/create-lecturer.dto';
import { LecturerResponseDto } from '@/modules/identity/presentation/dtos/lecturer/lecturer-response.dto';
import { CreateLecturerCommand } from '@/modules/identity/application/commands/lecturer/create-lecturer.command';
import { UserAggregate } from '@/modules/identity/domain/aggregates/user.aggregate';
import { ResponseMessage, ActiveUser, Roles } from '@/shared';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { GetLecturersQuery } from '@/modules/identity/application/queries/lecturer/get-lecturers.query';
import { GetLecturerByIdQuery } from '@/modules/identity/application/queries/lecturer/get-lecturer-by-id.query';
import { GetLecturerByEmailQuery } from '@/modules/identity/application/queries/lecturer/get-lecturer-by-email.query';
import { GetUsersDto } from '@/modules/identity/presentation/dtos/user/get-users.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { UpdateLecturerDto } from '@/modules/identity/presentation/dtos/lecturer/update-lecturer.dto';
import { JwtAccessGuard } from '@/modules/auth/infrastructure/guards/jwt-access.guard';
import { UpdateLecturerCommand } from '@/modules/identity/application/commands/lecturer/update-lecturer.command';

@ApiTags('Identity/lecturers')
@Controller('lecturers')
export class LecturerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new Lecturer profile' })
  @ResponseMessage('Lecturer created successfully')
  @ApiResponse({
    status: 201,
    description: 'Lecturer created successfully',
    type: LecturerResponseDto,
  })
  async create(
    @Body() dto: CreateLecturerDto,
    @ActiveUser('id') userId: string,
  ): Promise<LecturerResponseDto> {
    const user = await this.commandBus.execute<
      CreateLecturerCommand,
      UserAggregate
    >(
      new CreateLecturerCommand(
        dto.email,
        dto.fullName,
        dto.employeeCode,
        dto.degree,
        dto.department,
        dto.phoneNumber,
        userId,
      ),
    );

    // Map UserAggregate to LecturerResponseDto
    // Note: UserAggregate now has nested profiles
    return new LecturerResponseDto({
      id: user.id.toString(),
      email: user.email,
      fullName: user.fullName || '',
      avatarUrl: user.avatarUrl || null,
      employeeCode: user.lecturerProfile?.employeeCode || null,
      degree: user.lecturerProfile?.degree || null,
      department: user.lecturerProfile?.department || null,
      phoneNumber: user.lecturerProfile?.phoneNumber || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of lecturers' })
  @ResponseMessage('Get lecturers successfully')
  @ApiResponse({
    status: 200,
    description: 'List of lecturers retrieved successfully',
    type: CursorPageDto<LecturerResponseDto>,
  })
  async findAll(
    @Query() dto: GetUsersDto,
  ): Promise<CursorPageDto<LecturerResponseDto>> {
    return this.queryBus.execute(
      new GetLecturersQuery(
        dto.cursor,
        dto.take,
        dto.order,
        dto.searchEmail,
        dto.isActive,
      ),
    );
  }

  @Get('email/:email')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lecturer by email' })
  @ResponseMessage('Get lecturer successfully')
  @ApiResponse({
    status: 200,
    description: 'Lecturer detail retrieved successfully',
    type: LecturerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lecturer not found' })
  async findByEmail(
    @Param('email') email: string,
  ): Promise<LecturerResponseDto> {
    return this.queryBus.execute(new GetLecturerByEmailQuery(email));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lecturer by ID' })
  @ResponseMessage('Get lecturer successfully')
  @ApiResponse({
    status: 200,
    description: 'Lecturer detail retrieved successfully',
    type: LecturerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lecturer not found' })
  async findOne(@Param('id') id: string): Promise<LecturerResponseDto> {
    return this.queryBus.execute(new GetLecturerByIdQuery(id));
  }

  @Patch('me')
  @UseGuards(JwtAccessGuard)
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current lecturer profile' })
  @ResponseMessage('Update profile successfully')
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: LecturerResponseDto,
  })
  async updateMe(
    @Body() dto: UpdateLecturerDto,
    @ActiveUser('id') userId: string,
  ): Promise<LecturerResponseDto> {
    const user = await this.commandBus.execute<
      UpdateLecturerCommand,
      UserAggregate
    >(
      new UpdateLecturerCommand(
        userId,
        userId,
        dto.fullName,
        dto.employeeCode,
        dto.degree,
        dto.department,
        dto.phoneNumber,
      ),
    );

    return new LecturerResponseDto({
      id: user.id.toString(),
      email: user.email,
      fullName: user.fullName || '',
      avatarUrl: user.avatarUrl || null,
      employeeCode: user.lecturerProfile?.employeeCode || null,
      degree: user.lecturerProfile?.degree || null,
      department: user.lecturerProfile?.department || null,
      phoneNumber: user.lecturerProfile?.phoneNumber || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAccessGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lecturer profile by ID' })
  @ResponseMessage('Update lecturer successfully')
  @ApiResponse({
    status: 200,
    description: 'Lecturer updated successfully',
    type: LecturerResponseDto,
  })
  async updateOne(
    @Param('id') id: string,
    @Body() dto: UpdateLecturerDto,
    @ActiveUser('id') editorId: string,
  ): Promise<LecturerResponseDto> {
    const user = await this.commandBus.execute<
      UpdateLecturerCommand,
      UserAggregate
    >(
      new UpdateLecturerCommand(
        id,
        editorId,
        dto.fullName,
        dto.employeeCode,
        dto.degree,
        dto.department,
        dto.phoneNumber,
      ),
    );

    return new LecturerResponseDto({
      id: user.id.toString(),
      email: user.email,
      fullName: user.fullName || '',
      avatarUrl: user.avatarUrl || null,
      employeeCode: user.lecturerProfile?.employeeCode || null,
      degree: user.lecturerProfile?.degree || null,
      department: user.lecturerProfile?.department || null,
      phoneNumber: user.lecturerProfile?.phoneNumber || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
