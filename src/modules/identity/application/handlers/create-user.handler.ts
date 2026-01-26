import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { CreateUserCommand } from '../commands/create-user.command';
import { UserRole } from '../../domain/enums/user-role.enum';
import { InvalidRoleOperationException } from '../../domain/exceptions/user.exceptions';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async execute(command: CreateUserCommand): Promise<UserAggregate> {
    const { email, fullName, provider, providerId, avatarUrl, role } = command;

    // Default to STUDENT if role not specified
    const userRole = role || UserRole.STUDENT;

    let user: UserAggregate;

    // Create user based on role
    switch (userRole) {
      case UserRole.STUDENT:
        user = UserAggregate.createStudent(
          email,
          fullName,
          undefined, // studentCode - empty initially
          provider,
          providerId,
          avatarUrl,
        );
        break;

      case UserRole.LECTURER:
        user = UserAggregate.createLecturer(
          email,
          fullName,
          provider,
          providerId,
          avatarUrl,
        );
        break;

      case UserRole.ADMIN:
        user = UserAggregate.createAdmin(
          email,
          fullName,
          provider,
          providerId,
          avatarUrl,
        );
        break;

      default:
        throw new InvalidRoleOperationException(userRole, 'create user');
    }

    return this.userRepository.create(user);
  }
}
