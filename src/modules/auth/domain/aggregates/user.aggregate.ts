import { AggregateRoot } from '@nestjs/cqrs';
import { UserRole } from '../enums/user-role.enum';

export type UserProps = {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  provider?: string | null;
  providerId?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class User extends AggregateRoot {
  private _props: UserProps;

  constructor(props: UserProps) {
    super();
    this._props = props;
  }

  get id(): string {
    return this._props.id;
  }

  get email(): string {
    return this._props.email;
  }

  get fullName(): string | null | undefined {
    return this._props.fullName;
  }

  get avatarUrl(): string | null | undefined {
    return this._props.avatarUrl;
  }

  get provider(): string | null | undefined {
    return this._props.provider;
  }

  get providerId(): string | null | undefined {
    return this._props.providerId;
  }

  get role(): UserRole {
    return this._props.role;
  }

  get isActive(): boolean {
    return this._props.isActive;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  public updateGoogleInfo(providerId: string, avatarUrl?: string): void {
    this._props.provider = 'google';
    this._props.providerId = providerId;
    if (avatarUrl) {
      this._props.avatarUrl = avatarUrl;
    }
    this._props.updatedAt = new Date();
  }

  // Example domain method
  public activate(): void {
    this._props.isActive = true;
    this._props.updatedAt = new Date();
  }
}
