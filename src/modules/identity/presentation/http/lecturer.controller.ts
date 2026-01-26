import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLecturerDto } from '../dtos/create-lecturer.dto';
import { LecturerResponseDto } from '../dtos/lecturer-response.dto';
import { CreateLecturerCommand } from '../../application/commands/create-lecturer.command';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { ResponseMessage, ActiveUser, Roles } from '@/shared';
import { UserRole } from '../../domain/enums/user-role.enum';

@ApiTags('Identity/lecturers')
@Controller('lecturers')
export class LecturerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new Lecturer profile' })
  @ResponseMessage('Lecturer created successfully')
  @ApiResponse({
    status: 201,
    description: 'Lecturer created successfully',
    type: LecturerResponseDto,
  })
  async create(
    @Body() dto: CreateLecturerDto,
    @ActiveUser('id') userId: string,
  ): Promise<LecturerResponseDto> {
    const user = await this.commandBus.execute<
      CreateLecturerCommand,
      UserAggregate
    >(
      new CreateLecturerCommand(
        dto.email,
        dto.fullName,
        dto.employeeCode,
        dto.degree,
        dto.department,
        dto.phoneNumber,
        userId,
      ),
    );

    // Map UserAggregate to LecturerResponseDto
    // Note: UserAggregate now has nested profiles
    return new LecturerResponseDto({
      id: user.id.toString(),
      email: user.email,
      fullName: user.fullName || '',
      avatarUrl: user.avatarUrl || null,
      employeeCode: user.lecturerProfile?.employeeCode || null,
      degree: user.lecturerProfile?.degree || null,
      department: user.lecturerProfile?.department || null,
      phoneNumber: user.lecturerProfile?.phoneNumber || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
