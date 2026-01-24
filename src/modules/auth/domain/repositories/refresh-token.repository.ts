import { RefreshToken } from '../aggregates/refresh-token.aggregate';

export interface IRefreshTokenRepository {
  create(refreshToken: RefreshToken): Promise<void>;

  findByJti(jti: string): Promise<RefreshToken | null>;

  save(refreshToken: RefreshToken): Promise<void>;

  revoke(jti: string): Promise<void>;

  revokeAllForUser(userId: string): Promise<void>;

  revokeAllForDevice(userId: string, deviceId: string): Promise<void>;

  deleteExpired(): Promise<number>;
}

export const IRefreshTokenRepository = Symbol('IRefreshTokenRepository');
