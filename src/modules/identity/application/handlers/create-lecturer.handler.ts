import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { CreateLecturerCommand } from '../commands/create-lecturer.command';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';

@CommandHandler(CreateLecturerCommand)
export class CreateLecturerHandler implements ICommandHandler<CreateLecturerCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async execute(command: CreateLecturerCommand): Promise<UserAggregate> {
    const { email, fullName, employeeCode, degree, department, phoneNumber } =
      command;

    let user = await this.userRepository.findByEmail(email);

    if (user) {
      // If user exists, maybe we want to upgrade them to Lecturer or throw error?
      // For now, let's throw if they already exist to be safe, or check role.
      throw new ConflictException('User with this email already exists');
    }

    user = UserAggregate.createLecturer(
      email,
      fullName,
      employeeCode,
      degree,
      department,
      phoneNumber,
    );

    return this.userRepository.create(user);
  }
}
