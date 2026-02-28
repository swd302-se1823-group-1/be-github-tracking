import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateClassDto } from '@/modules/academic/presentation/dtos/class/create-class.dto';
import { UpdateClassDto } from '@/modules/academic/presentation/dtos/class/update-class.dto';
import { ClassResponseDto } from '@/modules/academic/presentation/dtos/class/class-response.dto';
import { CreateClassCommand } from '@/modules/academic/application/commands/class/create-class.command';
import { UpdateClassCommand } from '@/modules/academic/application/commands/class/update-class.command';
import { DeleteClassCommand } from '@/modules/academic/application/commands/class/delete-class.command';
import { ActiveUser, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { ClassAggregate } from '@/modules/academic/domain/aggregates/class.aggregate';
import { ClassWithRelations } from '@/modules/academic/domain/types/class-with-relations.type';
import { EnrollStudentDto } from '@/modules/academic/presentation/dtos/enrollment/enroll-student.dto';
import { EnrollStudentCommand } from '@/modules/academic/application/commands/enrollment/enroll-student.command';
import { GetClassesDto } from '@/modules/academic/presentation/dtos/class/get-classes.dto';
import { GetClassesQuery } from '@/modules/academic/application/queries/class/get-classes.query';
import { GetClassByIdQuery } from '@/modules/academic/application/queries/class/get-class-by-id.query';
import { GetClassStudentsQuery } from '@/modules/academic/application/queries/class/get-class-students.query';
import { GetStudentClassesQuery } from '@/modules/academic/application/queries/class/get-student-classes.query';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';
import { CursorPageMetaDto } from '@/shared/dtos/cursor-page-meta.dto';
import { CreateProjectDto } from '@/modules/academic/presentation/dtos/project/create-project.dto';
import { CreateProjectCommand } from '@/modules/academic/application/commands/project/create-project.command';
import { ProjectResponseDto } from '@/modules/academic/presentation/dtos/project/project-response.dto';
import { ProjectDtoMapper } from '@/modules/academic/presentation/mappers/project-dto.mapper';
import { ProjectAggregate } from '@/modules/academic/domain/aggregates/project.aggregate';
import { GetProjectsByClassQuery } from '@/modules/academic/application/queries/project/get-projects-by-class.query';

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

  @Get(':id/students')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get students enrolled in a class' })
  @ApiResponse({
    status: 200,
    description: 'Return enrolled students',
  })
  async getStudents(
    @Param('id') classId: string,
    @Query() dto: GetClassesDto,
  ): Promise<CursorPageDto<any>> {
    const result = await this.queryBus.execute<
      GetClassStudentsQuery,
      {
        students: any[];
        total: number;
        nextCursor: string | null;
      }
    >(
      new GetClassStudentsQuery(
        classId,
        GetClassesQuery.fromDto(dto), // Reuse GetClassesQuery logic or just pass DTO if query expects it, but here query expects GetClassesQuery object?
        // Wait, GetClassStudentsQuery constructor defined as (classId, query: GetClassesQuery)
      ),
    );

    const meta = new CursorPageMetaDto({
      total: result.total,
      nextCursor: result.nextCursor,
      hasNextPage: !!result.nextCursor,
    });

    // Return students directly or map to DTO?
    // Using any for now as requested/planned
    return new CursorPageDto(result.students, meta);
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return a class',
    type: ClassResponseDto,
  })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<ClassResponseDto> {
    const clazz = await this.queryBus.execute<
      GetClassByIdQuery,
      ClassWithRelations
    >(new GetClassByIdQuery(id));
    return new ClassResponseDto(clazz);
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

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a class' })
  @ApiResponse({
    status: 200,
    description: 'Class updated successfully',
    type: ClassResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
    @ActiveUser() user: { id: string; role: UserRole },
  ): Promise<ClassResponseDto> {
    // Only ADMIN can reassign lecturerId
    const lecturerId =
      user.role === UserRole.ADMIN ? dto.lecturerId : undefined;
    const clazz = await this.commandBus.execute<
      UpdateClassCommand,
      ClassAggregate
    >(
      new UpdateClassCommand(
        id,
        dto.className,
        dto.description,
        dto.enrollPassword,
        lecturerId,
        user.id,
      ),
    );
    return new ClassResponseDto(clazz);
  }

  @Post(':id/projects')
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a project in a class' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectResponseDto,
  })
  async createProject(
    @Param('id') classId: string,
    @Body() dto: CreateProjectDto,
    @ActiveUser('id') userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.commandBus.execute<
      CreateProjectCommand,
      ProjectAggregate
    >(
      new CreateProjectCommand(
        classId,
        dto.name,
        dto.topic,
        dto.description,
        null, // avatarUrl handled separately
        userId,
      ),
    );
    return ProjectDtoMapper.toResponse(project);
  }

  @Get(':id/projects')
  @Roles(UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get projects in a class' })
  @ApiResponse({
    status: 200,
    description: 'Return projects',
    type: CursorPageDto,
  })
  async getProjects(
    @Param('id') classId: string,
    @Query() dto: GetClassesDto, // The client might send normal pagination params. GetClassesDto handles that.
  ): Promise<CursorPageDto<ProjectResponseDto>> {
    const result = await this.queryBus.execute<
      GetProjectsByClassQuery,
      {
        projects: ProjectAggregate[];
        total: number;
        nextCursor: string | null;
      }
    >(
      new GetProjectsByClassQuery(classId, {
        take: dto.take,
        cursor: dto.cursor,
        search: dto.search,
        order: dto.order, // order fits because both extend CursorPageOptionsDto
      }),
    );

    const meta = new CursorPageMetaDto({
      total: result.total,
      nextCursor: result.nextCursor,
      hasNextPage: !!result.nextCursor,
    });

    return new CursorPageDto(
      result.projects.map((p) => ProjectDtoMapper.toResponse(p)),
      meta,
    );
  }
}
