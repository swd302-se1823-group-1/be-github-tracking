import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { UpdateStudentCommand } from '@/modules/identity/application/commands/student/update-student.command';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository';
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo';
import { StudentResponseDto } from '@/modules/identity/presentation/dtos/student/student-response.dto';
import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

@CommandHandler(UpdateStudentCommand)
export class UpdateStudentHandler implements ICommandHandler<UpdateStudentCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async execute(command: UpdateStudentCommand): Promise<StudentResponseDto> {
    const { id, fullName, studentCode, universityEmail } = command;

    const user = await this.userRepository.findById(new UserId(id));
    if (!user || user.role !== UserRole.STUDENT) {
      throw new NotFoundException('Student not found');
    }

    user.updateStudent(fullName, studentCode, universityEmail);

    const updatedUser = await this.userRepository.update(user);

    return new StudentResponseDto({
      id: updatedUser.id.toString(),
      email: updatedUser.email,
      fullName: updatedUser.fullName || '',
      avatarUrl: updatedUser.avatarUrl,
      studentCode: updatedUser.studentProfile?.studentCode || null,
      universityEmail: updatedUser.studentProfile?.universityEmail || null,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  }
}
