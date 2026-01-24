import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateLecturerCommand } from '../commands/create-lecturer.command';
import { ILecturerRepository } from '../../domain/repositories/lecturer.repository';
import { Lecturer } from '../../domain/aggregates/lecturer.aggregate';
import { IUserRepository } from '@/modules/auth/domain/repositories/user.repository';
import { generateId } from '@/shared/utils/uuid';
import { User } from '@/modules/auth/domain/aggregates/user.aggregate';
import { UserRole } from '@/modules/auth/domain/enums/user-role.enum';

@CommandHandler(CreateLecturerCommand)
export class CreateLecturerHandler implements ICommandHandler<CreateLecturerCommand> {
  constructor(
    private readonly lecturerRepository: ILecturerRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateLecturerCommand): Promise<Lecturer> {
    const { email, fullName, employeeCode, degree, department, phoneNumber } =
      command;

    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      user = new User({
        id: generateId(),
        email,
        fullName,
        role: UserRole.LECTURER,
        provider: null,
        providerId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.userRepository.create(user);
    }

    const lecturer = new Lecturer({
      id: user.id,
      employeeCode,
      degree,
      department,
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.lecturerRepository.create(lecturer);
  }
}
