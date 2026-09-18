import { IQuery } from '@nestjs/cqrs';

export class FindUserByProviderIdQuery implements IQuery {
  constructor(public readonly providerId: string) {}
}
