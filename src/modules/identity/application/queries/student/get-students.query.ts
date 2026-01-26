import { Order } from '@/shared/dtos/cursor-page-options.dto';

export class GetStudentsQuery {
  constructor(
    public readonly cursor: string | undefined,
    public readonly take: number,
    public readonly order: Order,
    public readonly searchEmail?: string,
    public readonly isActive?: boolean,
  ) {}
}
