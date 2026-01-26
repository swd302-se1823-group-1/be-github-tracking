import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import { Order } from '@/shared/dtos/cursor-page-options.dto';

export class GetUsersQuery {
  constructor(
    public readonly cursor: string | undefined,
    public readonly take: number,
    public readonly order: Order,
    public readonly searchEmail?: string,
    public readonly role?: UserRole,
    public readonly isActive?: boolean,
  ) {}
}
