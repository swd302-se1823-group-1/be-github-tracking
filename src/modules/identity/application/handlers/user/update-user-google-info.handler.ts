import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository';
import { UserAggregate } from '@/modules/identity/domain/aggregates/user.aggregate';
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo';
import { UpdateUserGoogleInfoCommand } from '@/modules/identity/application/commands/user/update-user-google-info.command';

@CommandHandler(UpdateUserGoogleInfoCommand)
export class UpdateUserGoogleInfoHandler implements ICommandHandler<UpdateUserGoogleInfoCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UpdateUserGoogleInfoCommand): Promise<UserAggregate> {
    const { userId, providerId, avatarUrl } = command;

    const user = await this.userRepository.findById(UserId.fromString(userId));
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.updateGoogleInfo(providerId, avatarUrl);
    await this.userRepository.update(user);

    return user; // Return updated user to avoid extra query
  }
}
