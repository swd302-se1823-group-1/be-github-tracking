import {
  ValidationException,
  BusinessRuleViolationException,
} from '@/shared/exceptions/domain.exception';

/**
 * Thrown when user ID has invalid UUID format
 */
export class InvalidUserIdException extends ValidationException {
  constructor(id: string) {
    super('userId', `Invalid UUID format: ${id}`, { id });
  }
}

/**
 * Thrown when operation is not allowed for user's role
 */
export class InvalidRoleOperationException extends BusinessRuleViolationException {
  constructor(role: string, operation: string) {
    super('Role mismatch', `Cannot ${operation} for role ${role}`, {
      role,
      operation,
    });
  }
}

/**
 * Thrown when required field is missing for specific context
 */
export class RequiredFieldException extends ValidationException {
  constructor(field: string, context: string) {
    super(field, `${field} is required for ${context}`, { context });
  }
}
