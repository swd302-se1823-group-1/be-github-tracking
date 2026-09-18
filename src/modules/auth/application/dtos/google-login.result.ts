import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

export interface GoogleLoginUserResult {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

export interface GoogleLoginResult {
  accessToken: string;
  refreshToken: string;
  user: GoogleLoginUserResult;
}
