import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { CreateUserCommand } from '../commands/create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserAggregate> {
    const { email, fullName, provider, providerId, avatarUrl } = command;

    // Use the factory method from UserAggregate.
    // Assuming default strategy is to create a STUDENT if not specified,
    // or generic user. Based on UserAggregate logic, we can use createStudent
    // or we might need a more generic create method if roles aren't decided yet.
    // For Google Login, it's often a Student (or we need to update UserAggregate to support generic creation).
    // Let's use createStudent for now as it's the most common case for external signup,
    // or add a TODO to handle roles better.

    const user = UserAggregate.createStudent(
      email,
      fullName,
      undefined, // studentCode - likely empty initially
      provider,
      providerId,
      avatarUrl,
    );

    return this.userRepository.create(user);
  }
}
