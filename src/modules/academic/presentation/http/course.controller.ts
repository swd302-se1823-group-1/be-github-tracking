import { Body, Controller, Post, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCourseDto } from '@/modules/academic/presentation/dtos/course/create-course.dto';
import { UpdateCourseDto } from '@/modules/academic/presentation/dtos/course/update-course.dto';
import { CourseResponseDto } from '@/modules/academic/presentation/dtos/course/course-response.dto';
import { CreateCourseCommand } from '@/modules/academic/application/commands/course/create-course.command';
import { UpdateCourseCommand } from '@/modules/academic/application/commands/course/update-course.command';
import { ActiveUser, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { CourseAggregate } from '@/modules/academic/domain/aggregates/course.aggregate';

import { GetCoursesQuery } from '@/modules/academic/application/queries/course/get-courses.query';
import { GetCourseByIdQuery } from '@/modules/academic/application/queries/course/get-course-by-id.query';
import { DeleteCourseCommand } from '@/modules/academic/application/commands/course/delete-course.command';
import { GetCourseByCodeQuery } from '@/modules/academic/application/queries/course/get-course-by-code.query';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { CursorPageMetaDto } from '@/shared/dtos/cursor-page-meta.dto';
import { GetCoursesDto } from '@/modules/academic/presentation/dtos/course/get-courses.dto';
import { Param, Get, Query, Delete } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

@ApiTags('Academic/courses')
@Controller('courses')
export class CourseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseResponseDto,
  })
  async create(
    @Body() dto: CreateCourseDto,
    @ActiveUser('id') userId: string,
  ): Promise<CourseResponseDto> {
    const course = await this.commandBus.execute<
      CreateCourseCommand,
      CourseAggregate
    >(new CreateCourseCommand(dto.code, dto.name, userId));
    return new CourseResponseDto(course);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({
    status: 200,
    description: 'Return all courses',
    type: CursorPageDto,
  })
  @ApiBearerAuth()
  async findAll(
    @Query() dto: GetCoursesDto,
  ): Promise<CursorPageDto<CourseResponseDto>> {
    const result = await this.queryBus.execute<
      GetCoursesQuery,
      {
        courses: CourseAggregate[];
        total: number;
        nextCursor: string | null;
      }
    >(GetCoursesQuery.fromDto(dto));

    const meta = new CursorPageMetaDto({
      total: result.total,
      nextCursor: result.nextCursor,
      hasNextPage: !!result.nextCursor,
    });

    return new CursorPageDto(
      result.courses.map((course) => new CourseResponseDto(course)),
      meta,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return a course',
    type: CourseResponseDto,
  })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<CourseResponseDto> {
    const course = await this.queryBus.execute<
      GetCourseByIdQuery,
      CourseAggregate
    >(new GetCourseByIdQuery(id));
    return new CourseResponseDto(course);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a course by Code' })
  @ApiResponse({
    status: 200,
    description: 'Return a course',
    type: CourseResponseDto,
  })
  @ApiBearerAuth()
  async findByCode(@Param('code') code: string): Promise<CourseResponseDto> {
    const course = await this.queryBus.execute<
      GetCourseByCodeQuery,
      CourseAggregate
    >(new GetCourseByCodeQuery(code));
    return new CourseResponseDto(course);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course (Soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Course deleted successfully',
  })
  async delete(
    @Param('id') id: string,
    @ActiveUser() user: { id: string },
  ): Promise<void> {
    await this.commandBus.execute(new DeleteCourseCommand(id, user.id));
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @ActiveUser('id') userId: string,
  ): Promise<CourseResponseDto> {
    const course = await this.commandBus.execute<
      UpdateCourseCommand,
      CourseAggregate
    >(new UpdateCourseCommand(id, dto.name, userId));
    return new CourseResponseDto(course);
  }
}
