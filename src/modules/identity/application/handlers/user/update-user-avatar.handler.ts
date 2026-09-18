import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { UpdateUserAvatarCommand } from '../../commands/user/update-user-avatar.command';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository';
import { UserAggregate } from '@/modules/identity/domain/aggregates/user.aggregate';
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo';

@CommandHandler(UpdateUserAvatarCommand)
export class UpdateUserAvatarHandler implements ICommandHandler<UpdateUserAvatarCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async execute(command: UpdateUserAvatarCommand): Promise<UserAggregate> {
    const { userId, avatarUrl, updatedBy } = command;

    const user = await this.userRepository.findById(new UserId(userId));

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Update avatar URL
    user.updateAvatar(avatarUrl);
    user.setUpdatedBy(updatedBy);

    return this.userRepository.update(user);
  }
}
