import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; deviceId: string; jti: string; role: string };

      cookies?: Record<string, string>;
    }
  }
}
