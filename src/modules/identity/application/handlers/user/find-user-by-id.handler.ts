import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindUserByIdQuery } from '@/modules/identity/application/queries/user/find-user-by-id.query';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository';
import { UserAggregate } from '@/modules/identity/domain/aggregates/user.aggregate';
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo';

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: FindUserByIdQuery): Promise<UserAggregate | null> {
    return this.userRepository.findById(UserId.fromString(query.userId));
  }
}
