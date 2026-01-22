export interface IRefreshTokenRepository {
  create(data: {
    jti: string;
    userId: string;
    deviceId: string;
    expiresAt: Date;
  }): Promise<void>;
}

export const IRefreshTokenRepository = Symbol('IRefreshTokenRepository');
