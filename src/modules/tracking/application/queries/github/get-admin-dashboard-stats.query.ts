import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

export class GetAdminDashboardStatsQuery {
  constructor(public readonly role: UserRole) {}
}
