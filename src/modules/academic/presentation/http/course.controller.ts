import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCourseDto } from '../dtos/course/create-course.dto';
import { CourseResponseDto } from '../dtos/course/course-response.dto';
import { CreateCourseCommand } from '../../application/commands/course/create-course.command';
import { ActiveUser, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { CourseAggregate } from '@/modules/academic/domain/aggregates/course.aggregate';

@ApiTags('Academic/courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
