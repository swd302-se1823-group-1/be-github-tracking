import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateAdminCommand } from '../../commands/admin/update-admin.command';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserAggregate } from '../../../domain/aggregates/user.aggregate';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { InvalidRoleOperationException } from '../../../domain/exceptions/user.exceptions';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(UpdateAdminCommand)
export class UpdateAdminHandler implements ICommandHandler<
  UpdateAdminCommand,
  UserAggregate
> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async execute(command: UpdateAdminCommand): Promise<UserAggregate> {
    const { id, editorId, fullName } = command;

    const user = await this.userRepository.findById(new UserId(id));
    if (!user) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    if (user.role !== UserRole.ADMIN) {
      throw new InvalidRoleOperationException(user.role, 'update as admin');
    }

    // Update Full Name if provided
    if (fullName) {
      user.updateFullName(fullName);
    }

    user.setUpdatedBy(editorId);

    return this.userRepository.update(user);
  }
}
