import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetStudentsQuery } from '../../application/queries/get-students.query';
import { GetStudentByIdQuery } from '../../application/queries/get-student-by-id.query';
import { StudentResponseDto } from '../dtos/student-response.dto';
import { Roles } from '@/shared';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { UserRole } from '../../domain/enums/user-role.enum';
import { GetUsersDto } from '../dtos/get-users.dto';

@ApiTags('Identity/students')
@Controller('students')
export class StudentController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LECTURER) // Only Admin and Lecturers should generally list students, or maybe strict to Admin?
  // User request: "làm tính năng lấy ra student" - assuming for management purposes.
  // I will add ADMIN and LECTURER as a safe default, can be adjusted.
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of students' })
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
  @ApiResponse({
    status: 200,
    description: 'Student details retrieved successfully',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findOne(@Param('id') id: string): Promise<StudentResponseDto> {
    return this.queryBus.execute(new GetStudentByIdQuery(id));
  }
}
