import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindUserByProviderIdQuery } from '../queries/find-user-by-provider-id.query';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';

@QueryHandler(FindUserByProviderIdQuery)
export class FindUserByProviderIdHandler implements IQueryHandler<FindUserByProviderIdQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: FindUserByProviderIdQuery,
  ): Promise<UserAggregate | null> {
    const { providerId } = query;
    return this.userRepository.findByProviderId(providerId);
  }
}
