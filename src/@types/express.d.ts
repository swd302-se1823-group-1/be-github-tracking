import 'express';

interface UserPayload {
  userId: string;
  deviceId: string;
  jti: string;
  role: string;
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
