import { v7 as uuidv7, validate as uuidValidate } from 'uuid';

export class UserId {
  constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new Error('Invalid UUID for UserId');
    }
  }

  static generate(): UserId {
    return new UserId(uuidv7());
  }

  static fromString(id: string): UserId {
    return new UserId(id);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
