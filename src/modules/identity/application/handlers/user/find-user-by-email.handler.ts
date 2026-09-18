import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindUserByEmailQuery } from '@/modules/identity/application/queries/user/find-user-by-email.query';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository';
import { UserAggregate } from '@/modules/identity/domain/aggregates/user.aggregate';

@QueryHandler(FindUserByEmailQuery)
export class FindUserByEmailHandler implements IQueryHandler<FindUserByEmailQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: FindUserByEmailQuery): Promise<UserAggregate | null> {
    return this.userRepository.findByEmail(query.email);
  }
}
