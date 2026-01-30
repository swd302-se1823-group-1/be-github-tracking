import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateClassDto } from '@/modules/academic/presentation/dtos/class/create-class.dto';
import { ClassResponseDto } from '@/modules/academic/presentation/dtos/class/class-response.dto';
import { CreateClassCommand } from '@/modules/academic/application/commands/class/create-class.command';
import { ActiveUser, Roles } from '@/shared/decorators';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { ClassAggregate } from '@/modules/academic/domain/aggregates/class.aggregate';

@ApiTags('Academic/classes')
@Controller('classes')
export class ClassController {
  constructor(private readonly commandBus: CommandBus) {}
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
}
