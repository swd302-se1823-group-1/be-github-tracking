import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateLecturerCommand } from '../../commands/lecturer/update-lecturer.command';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserAggregate } from '../../../domain/aggregates/user.aggregate';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { InvalidRoleOperationException } from '../../../domain/exceptions/user.exceptions';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(UpdateLecturerCommand)
export class UpdateLecturerHandler implements ICommandHandler<
  UpdateLecturerCommand,
  UserAggregate
> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async execute(command: UpdateLecturerCommand): Promise<UserAggregate> {
    const {
      id,
      editorId,
      fullName,
      employeeCode,
      degree,
      department,
      phoneNumber,
    } = command;

    const user = await this.userRepository.findById(new UserId(id));
    if (!user) {
      throw new NotFoundException(`Lecturer with ID ${id} not found`);
    }

    if (user.role !== UserRole.LECTURER) {
      throw new InvalidRoleOperationException(user.role, 'update as lecturer');
    }

    // Update Full Name if provided
    if (fullName) {
      user.updateFullName(fullName);
    }

    user.updateLecturerProfile(employeeCode, degree, department, phoneNumber);

    user.setUpdatedBy(editorId);

    return this.userRepository.update(user);
  }
}
