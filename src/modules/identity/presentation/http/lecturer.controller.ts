import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLecturerDto } from '../dtos/lecturer/create-lecturer.dto';
import { LecturerResponseDto } from '../dtos/lecturer/lecturer-response.dto';
import { CreateLecturerCommand } from '../../application/commands/lecturer/create-lecturer.command';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { ResponseMessage, ActiveUser, Roles } from '@/shared';
import { UserRole } from '../../domain/enums/user-role.enum';
import { GetLecturersQuery } from '../../application/queries/lecturer/get-lecturers.query';
import { GetLecturerByIdQuery } from '../../application/queries/lecturer/get-lecturer-by-id.query';
import { GetLecturerByEmailQuery } from '../../application/queries/lecturer/get-lecturer-by-email.query';
import { GetUsersDto } from '../dtos/user/get-users.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';

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
}
