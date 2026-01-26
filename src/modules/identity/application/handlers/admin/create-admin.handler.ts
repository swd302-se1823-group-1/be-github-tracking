import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { CreateAdminCommand } from '@/modules/identity/application/commands/admin/create-admin.command';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository';
import { UserAggregate } from '@/modules/identity/domain/aggregates/user.aggregate';

@CommandHandler(CreateAdminCommand)
export class CreateAdminHandler implements ICommandHandler<CreateAdminCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async execute(command: CreateAdminCommand): Promise<UserAggregate> {
    const { email, fullName, avatarUrl, createdBy } = command;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = UserAggregate.createAdmin(
      email,
      fullName,
      undefined, // provider
      undefined, // providerId
      avatarUrl,
      createdBy,
    );

    return this.userRepository.create(user);
  }
}
