import { AggregateRoot } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

export class RefreshToken extends AggregateRoot {
  private _id: string;
  private _jti: string;
  private _userId: string;
  private _deviceId: string;
  private _expiresAt: Date;
  private _revokedAt: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(init: {
    id: string;
    jti: string;
    userId: string;
    deviceId: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super();
    this._id = init.id;
    this._jti = init.jti;
    this._userId = init.userId;
    this._deviceId = init.deviceId;
    this._expiresAt = init.expiresAt;
    this._revokedAt = init.revokedAt;
    this._createdAt = init.createdAt;
    this._updatedAt = init.updatedAt;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get jti(): string {
    return this._jti;
  }

  get userId(): string {
    return this._userId;
  }

  get deviceId(): string {
    return this._deviceId;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get revokedAt(): Date | null {
    return this._revokedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Setters
  set revokedAt(value: Date | null) {
    this._revokedAt = value;
    this._updatedAt = new Date();
  }

  // Business Methods
  public revoke(): void {
    this.revokedAt = new Date();
  }

  public isRevoked(): boolean {
    return !!this._revokedAt;
  }

  public isExpired(): boolean {
    return this._expiresAt < new Date();
  }

  public validate(userId: string): void {
    if (this.isRevoked()) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (this.isExpired()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (this._userId !== userId) {
      throw new UnauthorizedException('Token user mismatch');
    }
  }
}
