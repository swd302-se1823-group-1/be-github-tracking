import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from '../commands/create-user.command';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/aggregates/user.aggregate';
import { UserRole } from '../../domain/enums/user-role.enum';
import { generateId } from '@/shared/utils/uuid';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { email, fullName, role, provider, providerId } = command;

    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return existingUser;
    }

    const user = new User({
      id: generateId(),
      email,
      fullName,
      role: role as UserRole,
      provider: provider || null,
      providerId: providerId || null,
      isActive: true, // Default active
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.userRepository.create(user);
  }
}
