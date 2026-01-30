import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateSemesterDto } from '../dtos/semester/create-semester.dto';
import { SemesterResponseDto } from '../dtos/semester/semester-response.dto';
import { CreateSemesterCommand } from '../../application/commands/semester/create-semester.command';
import { ActiveUser, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { SemesterAggregate } from '@/modules/academic/domain/aggregates/semester.aggregate';

@ApiTags('Academic/semesters')
@Controller('semesters')
export class SemesterController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
