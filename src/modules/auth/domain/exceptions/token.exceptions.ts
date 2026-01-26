import { UnauthorizedException } from '@/shared/exceptions/domain.exception';

/**
 * Thrown when refresh token has been revoked
 */
export class TokenRevokedException extends UnauthorizedException {
  constructor(jti?: string) {
    super('Refresh token has been revoked', jti ? { jti } : undefined);
  }
}

/**
 * Thrown when refresh token has expired
 */
export class TokenExpiredException extends UnauthorizedException {
  constructor(expiresAt?: Date) {
    super(
      'Refresh token has expired',
      expiresAt ? { expiresAt: expiresAt.toISOString() } : undefined,
    );
  }
}

/**
 * Thrown when token user ID doesn't match the requesting user
 */
export class TokenUserMismatchException extends UnauthorizedException {
  constructor(tokenUserId: string, requestUserId: string) {
    super('Token user mismatch', {
      tokenUserId,
      requestUserId,
    });
  }
}
