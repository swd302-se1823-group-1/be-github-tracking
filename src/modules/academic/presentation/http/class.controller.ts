import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateClassDto } from '../dtos/class/create-class.dto';
import { ClassResponseDto } from '../dtos/class/class-response.dto';
import { CreateClassCommand } from '../../application/commands/class/create-class.command';
import { ActiveUser, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { ClassAggregate } from '@/modules/academic/domain/aggregates/class.aggregate';

@ApiTags('Academic/classes')
@Controller('classes')
export class ClassController {
  constructor(private readonly commandBus: CommandBus) {}
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Class created successfully',
    type: ClassResponseDto,
  })
  async create(
    @Body() dto: CreateClassDto,
    @ActiveUser('id') userId: string,
  ): Promise<ClassResponseDto> {
    const clazz = await this.commandBus.execute<
      CreateClassCommand,
      ClassAggregate
    >(
      new CreateClassCommand(
        dto.semesterId,
        dto.enrollPassword,
        dto.lecturerId,
        dto.courseId,
        dto.classCode,
        dto.className,
        dto.description,
        userId,
      ),
    );
    return new ClassResponseDto(clazz);
  }
}
