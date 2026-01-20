import { HttpStatus } from '@nestjs/common';

export abstract class DomainException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: HttpStatus,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
