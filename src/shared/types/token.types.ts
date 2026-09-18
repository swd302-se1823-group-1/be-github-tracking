import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';

export interface JwtTokenPayload {
  sub: string;
  deviceId: string;
  jti: string;
  iss: string;
  aud: string;
  iat: string;
  exp: string;
}

export interface TokenUserPayload {
  id: string;
  deviceId: string;
  jti: string;
  role: UserRole;
}
