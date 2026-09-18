import { UserRole } from '@/modules/identity/domain/enums/user-role.enum';
import 'express';

interface UserPayload {
  id: string;
  deviceId: string;
  jti: string;
  role: UserRole;
}

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  providerId: string;
  accessToken: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload | GoogleUser;

      cookies?: Record<string, string>;
    }
  }
}
