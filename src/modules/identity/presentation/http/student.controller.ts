import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetStudentsQuery } from '../../application/queries/student/get-students.query';
import { GetStudentByIdQuery } from '../../application/queries/student/get-student-by-id.query';
import { StudentResponseDto } from '../dtos/student/student-response.dto';
import { UpdateStudentDto } from '../dtos/student/update-student.dto';
import { UpdateStudentCommand } from '../../application/commands/student/update-student.command';
import { Roles, ActiveUser, ResponseMessage } from '@/shared';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { UserRole } from '../../domain/enums/user-role.enum';
import { GetUsersDto } from '../dtos/user/get-users.dto';

@ApiTags('Identity/students')
@Controller('students')
export class StudentController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LECTURER) // Only Admin and Lecturers should generally list students, or maybe strict to Admin?
  // User request: "làm tính năng lấy ra student" - assuming for management purposes.
  // I will add ADMIN and LECTURER as a safe default, can be adjusted.
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of students' })
  @ResponseMessage('Get students successfully')
  @ApiResponse({
    status: 200,
    description: 'List of students retrieved successfully',
    type: CursorPageDto<StudentResponseDto>,
  })
  async findAll(
    @Query() dto: GetUsersDto,
  ): Promise<CursorPageDto<StudentResponseDto>> {
    return this.queryBus.execute(
      new GetStudentsQuery(
        dto.cursor,
        dto.take,
        dto.order,
        dto.searchEmail,
        dto.isActive,
      ),
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student details by ID' })
  @ResponseMessage('Get student successfully')
  @ApiResponse({
    status: 200,
    description: 'Student details retrieved successfully',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findOne(@Param('id') id: string): Promise<StudentResponseDto> {
    return this.queryBus.execute(new GetStudentByIdQuery(id));
  }

  @Patch('me')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own student profile' })
  @ResponseMessage('Student profile updated successfully')
  @ApiResponse({
    status: 200,
    description: 'Student profile updated successfully',
    type: StudentResponseDto,
  })
  async updateMe(
    @ActiveUser('id') userId: string,
    @Body() dto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    return this.commandBus.execute(
      new UpdateStudentCommand(
        userId,
        dto.fullName,
        dto.studentCode,
        dto.universityEmail,
      ),
    );
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN) // Assuming only Admin can update student details this way
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update student profile' })
  @ResponseMessage('Student profile updated successfully')
  @ApiResponse({
    status: 200,
    description: 'Student profile updated successfully',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    return this.commandBus.execute(
      new UpdateStudentCommand(
        id,
        dto.fullName,
        dto.studentCode,
        dto.universityEmail,
      ),
    );
  }
}
