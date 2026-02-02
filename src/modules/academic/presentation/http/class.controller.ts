import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateClassDto } from '@/modules/academic/presentation/dtos/class/create-class.dto';
import { ClassResponseDto } from '@/modules/academic/presentation/dtos/class/class-response.dto';
import { CreateClassCommand } from '@/modules/academic/application/commands/class/create-class.command';
import { DeleteClassCommand } from '@/modules/academic/application/commands/class/delete-class.command';
import { ActiveUser, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { ClassAggregate } from '@/modules/academic/domain/aggregates/class.aggregate';
import { ClassWithRelations } from '@/modules/academic/domain/types/class-with-relations.type';
import { EnrollStudentDto } from '@/modules/academic/presentation/dtos/enrollment/enroll-student.dto';
import { EnrollStudentCommand } from '@/modules/academic/application/commands/enrollment/enroll-student.command';
import { GetClassesDto } from '@/modules/academic/presentation/dtos/class/get-classes.dto';
import { GetClassesQuery } from '@/modules/academic/application/queries/class/get-classes.query';
import { GetStudentClassesQuery } from '@/modules/academic/application/queries/class/get-student-classes.query';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { CursorPageMetaDto } from '@/shared/dtos/cursor-page-meta.dto';

@ApiTags('Academic/classes')
@Controller('classes')
export class ClassController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @Post()
  @Roles(UserRole.ADMIN, UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Class created successfully',
    type: ClassResponseDto,
  })
  async create(
    @Body() dto: CreateClassDto,
    @ActiveUser() user: { id: string; role: UserRole },
  ): Promise<ClassResponseDto> {
    const lecturerId =
      user.role === UserRole.LECTURER ? user.id : dto.lecturerId;

    const clazz = await this.commandBus.execute<
      CreateClassCommand,
      ClassAggregate
    >(
      new CreateClassCommand(
        dto.semesterId,
        dto.enrollPassword,
        lecturerId,
        dto.courseId,
        dto.classCode,
        dto.className,
        dto.description,
        user.id,
      ),
    );
    return new ClassResponseDto(clazz);
  }

  @Get()
  @ApiOperation({ summary: 'Get all classes' })
  @ApiResponse({
    status: 200,
    description: 'Return all classes',
    type: CursorPageDto,
  })
  @ApiBearerAuth()
  async findAll(
    @Query() dto: GetClassesDto,
  ): Promise<CursorPageDto<ClassResponseDto>> {
    const result = await this.queryBus.execute<
      GetClassesQuery,
      {
        classes: ClassWithRelations[];
        total: number;
        nextCursor: string | null;
      }
    >(GetClassesQuery.fromDto(dto));

    const meta = new CursorPageMetaDto({
      total: result.total,
      nextCursor: result.nextCursor,
      hasNextPage: !!result.nextCursor,
    });

    return new CursorPageDto(
      result.classes.map((clazz) => new ClassResponseDto(clazz)),
      meta,
    );
  }

  @Get('/me')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get classes enrolled by the current student' })
  @ApiResponse({
    status: 200,
    description: 'Return enrolled classes',
  })
  async getMyEnrollments(
    @Query() dto: GetClassesDto,
    @ActiveUser() user: { id: string },
  ): Promise<CursorPageDto<ClassResponseDto>> {
    const result = await this.queryBus.execute<
      GetStudentClassesQuery,
      {
        classes: ClassWithRelations[];
        total: number;
        nextCursor: string | null;
      }
    >(
      new GetStudentClassesQuery(
        user.id,
        dto.cursor,
        dto.take,
        dto.order,
        dto.search,
      ),
    );

    const meta = new CursorPageMetaDto({
      total: result.total,
      nextCursor: result.nextCursor,
      hasNextPage: !!result.nextCursor,
    });

    return new CursorPageDto(
      result.classes.map((clazz) => new ClassResponseDto(clazz)),
      meta,
    );
  }

  @Post(':id/enroll')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll in a class' })
  @ApiResponse({
    status: 201,
    description: 'Enrolled successfully',
  })
  async enroll(
    @Param('id') classId: string,
    @Body() dto: EnrollStudentDto,
    @ActiveUser() user: { id: string },
  ): Promise<void> {
    await this.commandBus.execute(
      new EnrollStudentCommand(classId, dto.enrollPassword, user.id),
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a class (Soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Class deleted successfully',
  })
  async delete(
    @Param('id') id: string,
    @ActiveUser() user: { id: string },
  ): Promise<void> {
    await this.commandBus.execute(new DeleteClassCommand(id, user.id));
  }
}
