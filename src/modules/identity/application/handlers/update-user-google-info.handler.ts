import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UpdateUserGoogleInfoCommand } from '../commands/update-user-google-info.command';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';

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
