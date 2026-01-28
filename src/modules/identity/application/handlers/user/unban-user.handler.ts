import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UnbanUserCommand } from '../../commands/user/unban-user.command';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(UnbanUserCommand)
export class UnbanUserHandler implements ICommandHandler<UnbanUserCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async execute(command: UnbanUserCommand): Promise<void> {
    const { id, unbannedById } = command;
    const user = await this.userRepository.findById(new UserId(id));

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.unban(unbannedById);
    await this.userRepository.update(user);
  }
}
