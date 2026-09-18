import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { BanUserCommand } from '@/modules/identity/application/commands/user/ban-user.command';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository';
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(BanUserCommand)
export class BanUserHandler implements ICommandHandler<BanUserCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async execute(command: BanUserCommand): Promise<void> {
    const { id, bannedById } = command;
    const user = await this.userRepository.findById(new UserId(id));

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.ban(bannedById);
    await this.userRepository.update(user);
  }
}
