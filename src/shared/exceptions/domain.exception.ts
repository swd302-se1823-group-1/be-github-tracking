import { HttpStatus } from '@nestjs/common';

/**
 * Base class for all domain exceptions
 * Following DDD principles, domain exceptions represent business rule violations
 */
export abstract class DomainException extends Error {
  public readonly timestamp: Date;

  constructor(
    public readonly message: string,
    public readonly statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly code?: string,
    public readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      metadata: this.metadata,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Thrown when a requested resource is not found
 * HTTP Status: 404 NOT FOUND
 */
export class NotFoundException extends DomainException {
  constructor(
    resource: string,
    identifier?: string | number,
    metadata?: Record<string, any>,
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(message, HttpStatus.NOT_FOUND, 'RESOURCE_NOT_FOUND', {
      resource,
      identifier,
      ...metadata,
    });
  }
}

/**
 * Thrown when a resource already exists (duplicate)
 * HTTP Status: 409 CONFLICT
 */
export class ConflictException extends DomainException {
  constructor(
    resource: string,
    field: string,
    value?: string | number,
    metadata?: Record<string, any>,
  ) {
    const message = value
      ? `${resource} with ${field} '${value}' already exists`
      : `${resource} already exists`;

    super(message, HttpStatus.CONFLICT, 'RESOURCE_CONFLICT', {
      resource,
      field,
      value,
      ...metadata,
    });
  }
}

/**
 * Thrown when business rules are violated
 * HTTP Status: 422 UNPROCESSABLE ENTITY
 */
export class BusinessRuleViolationException extends DomainException {
  constructor(rule: string, details?: string, metadata?: Record<string, any>) {
    const message = details
      ? `Business rule violated: ${rule}. ${details}`
      : `Business rule violated: ${rule}`;

    super(message, HttpStatus.UNPROCESSABLE_ENTITY, 'BUSINESS_RULE_VIOLATION', {
      rule,
      details,
      ...metadata,
    });
  }
}

/**
 * Thrown when domain validation fails (value objects, aggregates)
 * HTTP Status: 400 BAD REQUEST
 */
export class ValidationException extends DomainException {
  constructor(field: string, reason: string, metadata?: Record<string, any>) {
    const message = `Validation failed for '${field}': ${reason}`;

    super(message, HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', {
      field,
      reason,
      ...metadata,
    });
  }
}

/**
 * Thrown when an operation is not permitted
 * HTTP Status: 403 FORBIDDEN
 */
export class ForbiddenException extends DomainException {
  constructor(
    operation: string,
    reason?: string,
    metadata?: Record<string, any>,
  ) {
    const message = reason
      ? `Operation '${operation}' is forbidden: ${reason}`
      : `Operation '${operation}' is forbidden`;

    super(message, HttpStatus.FORBIDDEN, 'OPERATION_FORBIDDEN', {
      operation,
      reason,
      ...metadata,
    });
  }
}

/**
 * Thrown when authentication fails
 * HTTP Status: 401 UNAUTHORIZED
 */
export class UnauthorizedException extends DomainException {
  constructor(reason?: string, metadata?: Record<string, any>) {
    const message = reason
      ? `Authentication failed: ${reason}`
      : 'Authentication required';

    super(message, HttpStatus.UNAUTHORIZED, 'AUTHENTICATION_FAILED', {
      reason,
      ...metadata,
    });
  }
}

/**
 * Thrown when an aggregate or entity is in an invalid state
 * HTTP Status: 422 UNPROCESSABLE ENTITY
 */
export class InvalidStateException extends DomainException {
  constructor(
    entity: string,
    currentState: string,
    expectedState?: string,
    metadata?: Record<string, any>,
  ) {
    const message = expectedState
      ? `${entity} is in invalid state '${currentState}'. Expected: ${expectedState}`
      : `${entity} is in invalid state '${currentState}'`;

    super(message, HttpStatus.UNPROCESSABLE_ENTITY, 'INVALID_STATE', {
      entity,
      currentState,
      expectedState,
      ...metadata,
    });
  }
}

/**
 * Thrown when external service or infrastructure fails
 * HTTP Status: 502 BAD GATEWAY or 503 SERVICE UNAVAILABLE
 */
export class InfrastructureException extends DomainException {
  constructor(
    service: string,
    operation: string,
    reason?: string,
    metadata?: Record<string, any>,
  ) {
    const message = reason
      ? `Infrastructure service '${service}' failed during '${operation}': ${reason}`
      : `Infrastructure service '${service}' failed during '${operation}'`;

    super(message, HttpStatus.BAD_GATEWAY, 'INFRASTRUCTURE_ERROR', {
      service,
      operation,
      reason,
      ...metadata,
    });
  }
}
