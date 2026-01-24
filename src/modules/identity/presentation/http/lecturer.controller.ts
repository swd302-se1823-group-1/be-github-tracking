import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLecturerDto } from '../dtos/create-lecturer.dto';
import { LecturerResponseDto } from '../dtos/lecturer-response.dto';
import { CreateLecturerCommand } from '../../application/commands/create-lecturer.command';
import { Lecturer } from '../../domain/aggregates/lecturer.aggregate';

@ApiTags('Identity')
@Controller('lecturers')
export class LecturerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Create a new Lecturer profile' })
  @ApiResponse({
    status: 201,
    description: 'Lecturer created successfully',
    type: LecturerResponseDto,
  })
  async create(@Body() dto: CreateLecturerDto): Promise<LecturerResponseDto> {
    const lecturer = await this.commandBus.execute<
      CreateLecturerCommand,
      Lecturer
    >(
      new CreateLecturerCommand(
        dto.email,
        dto.fullName,
        dto.employeeCode,
        dto.degree,
        dto.department,
        dto.phoneNumber,
      ),
    );

    // Map Domain Aggregate to Response DTO
    // Since Aggregate encapsulates props in _props (private), we need a way to extract them or use getter
    // Assuming Aggregate getters match DTO properties
    return new LecturerResponseDto({
      id: lecturer.id,
      employeeCode: lecturer.employeeCode ?? null,
      degree: lecturer.degree ?? null,
      department: lecturer.department ?? null,
      phoneNumber: lecturer.phoneNumber ?? null,
      createdAt: lecturer.createdAt,
      updatedAt: lecturer.updatedAt,
    });
  }
}
