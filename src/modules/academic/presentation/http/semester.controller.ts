import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateSemesterDto } from '@/modules/academic/presentation/dtos/semester/create-semester.dto';
import { UpdateSemesterDto } from '@/modules/academic/presentation/dtos/semester/update-semester.dto';
import { SemesterResponseDto } from '@/modules/academic/presentation/dtos/semester/semester-response.dto';
import { CreateSemesterCommand } from '@/modules/academic/application/commands/semester/create-semester.command';
import { UpdateSemesterCommand } from '@/modules/academic/application/commands/semester/update-semester.command';
import { GetSemestersQuery } from '@/modules/academic/application/queries/semester/get-semesters.query';
import { GetSemestersDto } from '@/modules/academic/presentation/dtos/semester/get-semesters.dto';
import { ActiveUser, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { SemesterAggregate } from '@/modules/academic/domain/aggregates/semester.aggregate';
import { CursorPageDto } from '@/shared/dtos/cursor-page.dto';

@ApiTags('Academic/semesters')
@Controller('semesters')
export class SemesterController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new semester' })
  @ApiResponse({
    status: 201,
    description: 'Semester created successfully',
    type: SemesterResponseDto,
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() dto: CreateSemesterDto,
    @ActiveUser('id') userId: string,
  ): Promise<SemesterResponseDto> {
    const semester = await this.commandBus.execute<
      CreateSemesterCommand,
      SemesterAggregate
    >(
      new CreateSemesterCommand(
        dto.code,
        dto.name,
        dto.startDate,
        dto.endDate,
        dto.isActive,
        userId,
      ),
    );
    return new SemesterResponseDto(semester);
  }

  @Get()
  @ApiOperation({ summary: 'Get all semesters' })
  @ApiResponse({
    status: 200,
    description: 'Return all semesters',
    type: CursorPageDto,
  })
  @ApiBearerAuth()
  async findAll(
    @Query() dto: GetSemestersDto,
  ): Promise<CursorPageDto<SemesterResponseDto>> {
    return this.queryBus.execute(GetSemestersQuery.fromDto(dto));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a semester' })
  @ApiResponse({
    status: 200,
    description: 'Semester updated successfully',
    type: SemesterResponseDto,
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSemesterDto,
    @ActiveUser('id') userId: string,
  ): Promise<SemesterResponseDto> {
    const semester = await this.commandBus.execute<
      UpdateSemesterCommand,
      SemesterAggregate
    >(
      new UpdateSemesterCommand(
        id,
        dto.code,
        dto.name,
        dto.startDate,
        dto.endDate,
        dto.isActive,
        userId,
      ),
    );
    return new SemesterResponseDto(semester);
  }
}
