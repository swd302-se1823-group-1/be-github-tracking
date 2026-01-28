import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteUserCommand } from '../../commands/user/delete-user.command';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async execute(command: DeleteUserCommand): Promise<void> {
    const { id, deletedById } = command;
    const user = await this.userRepository.findById(new UserId(id));

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.softDelete(deletedById);
    await this.userRepository.update(user);
  }
}
