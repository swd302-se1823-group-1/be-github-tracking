import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLecturerDto } from '../dtos/create-lecturer.dto';
import { CreateLecturerCommand } from '../../application/commands/create-lecturer.command';
import { Lecturer } from '../../domain/aggregates/lecturer.aggregate';

@ApiTags('Identity')
@Controller('lecturers')
export class LecturerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Lecturer profile' })
  @ApiResponse({ status: 201, description: 'Lecturer created successfully' })
  async create(@Body() dto: CreateLecturerDto): Promise<Lecturer> {
    return this.commandBus.execute(
      new CreateLecturerCommand(
        dto.email,
        dto.fullName,
        dto.employeeCode,
        dto.degree,
        dto.department,
        dto.phoneNumber,
      ),
    );
  }
}
