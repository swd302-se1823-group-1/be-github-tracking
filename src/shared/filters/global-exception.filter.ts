import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';
import { Prisma } from '@generated/prisma/client';

/**
 * Standardized error response format
 */
interface ErrorResponse {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error: string;
  code?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

/**
 * Global Exception Filter following DDD principles
 * Catches all exceptions and formats them into standardized responses
 *
 * Exception Hierarchy (handled in order):
 * 1. DomainException - Business logic violations
 * 2. HttpException - NestJS built-in exceptions
 * 3. Prisma errors - Database-related errors
 * 4. Unknown errors - Unexpected errors
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Bypass Swagger routes - let Swagger handle its own routing
    if (request.url.includes('/docs') || request.url.includes('swagger')) {
      throw exception;
    }

    // Build error response based on exception type
    const errorResponse = this.buildErrorResponse(exception, request);

    // Log the error
    this.logError(exception, request, errorResponse);

    // Send response
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Build standardized error response from exception
   */
  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const baseResponse: Partial<ErrorResponse> = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // 1. Handle Domain Exceptions (DDD business logic)
    if (exception instanceof DomainException) {
      return {
        ...baseResponse,
        statusCode: exception.statusCode,
        message: exception.message,
        error: exception.name,
        code: exception.code,
        metadata: exception.metadata,
        ...(this.isDevelopment && { stack: exception.stack }),
      } as ErrorResponse;
    }

    // 2. Handle NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return {
        ...baseResponse,
        statusCode: status,
        message:
          typeof exceptionResponse === 'object' &&
          'message' in exceptionResponse
            ? Array.isArray(exceptionResponse.message)
              ? exceptionResponse.message.join(', ')
              : String(exceptionResponse.message)
            : exception.message,
        error:
          typeof exceptionResponse === 'object' && 'error' in exceptionResponse
            ? String(exceptionResponse.error)
            : exception.name,
        ...(this.isDevelopment && { stack: exception.stack }),
      } as ErrorResponse;
    }

    // 3. Handle Prisma Database Errors
    if (this.isPrismaError(exception)) {
      return this.handlePrismaError(exception, baseResponse);
    }

    // 4. Handle Unknown Errors
    return this.handleUnknownError(exception, baseResponse);
  }

  /**
   * Handle Prisma database errors
   */
  private handlePrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
    baseResponse: Partial<ErrorResponse>,
  ): ErrorResponse {
    const code = exception.code;
    const meta = exception.meta;

    switch (code) {
      case 'P2002': {
        // Unique constraint violation
        const target = this.extractPrismaTarget(meta?.target);
        return {
          ...baseResponse,
          statusCode: HttpStatus.CONFLICT,
          message: `Resource already exists. Duplicate field: ${target}`,
          error: 'Conflict',
          code: 'DUPLICATE_RESOURCE',
          metadata: { fields: target, prismaCode: code },
        } as ErrorResponse;
      }

      case 'P2025': {
        // Record not found
        return {
          ...baseResponse,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          error: 'Not Found',
          code: 'RESOURCE_NOT_FOUND',
          metadata: { prismaCode: code },
        } as ErrorResponse;
      }

      case 'P2003': {
        // Foreign key constraint failed
        const field =
          typeof meta?.field_name === 'string'
            ? meta.field_name
            : 'unknown field';
        return {
          ...baseResponse,
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Invalid reference: ${field}`,
          error: 'Bad Request',
          code: 'INVALID_FOREIGN_KEY',
          metadata: { field, prismaCode: code },
        } as ErrorResponse;
      }

      case 'P2014': {
        // Required relation violation
        return {
          ...baseResponse,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Required relation constraint violated',
          error: 'Bad Request',
          code: 'REQUIRED_RELATION_VIOLATION',
          metadata: { prismaCode: code },
        } as ErrorResponse;
      }

      default: {
        // Other Prisma errors
        this.logger.error(`Unhandled Prisma error: ${code}`, exception.message);
        return {
          ...baseResponse,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: this.isDevelopment
            ? exception.message
            : 'Database operation failed',
          error: 'Internal Server Error',
          code: 'DATABASE_ERROR',
          metadata: { prismaCode: code },
          ...(this.isDevelopment && { stack: exception.stack }),
        } as ErrorResponse;
      }
    }
  }

  /**
   * Handle unknown/unexpected errors
   */
  private handleUnknownError(
    exception: unknown,
    baseResponse: Partial<ErrorResponse>,
  ): ErrorResponse {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error occurred';

    const stack = exception instanceof Error ? exception.stack : undefined;

    return {
      ...baseResponse,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.isDevelopment ? message : 'Internal server error',
      error: 'Internal Server Error',
      code: 'UNKNOWN_ERROR',
      ...(this.isDevelopment && stack && { stack }),
    } as ErrorResponse;
  }

  /**
   * Log error with appropriate level
   */
  private logError(
    exception: unknown,
    request: Request,
    errorResponse: ErrorResponse,
  ): void {
    const { statusCode, message, code } = errorResponse;
    const logContext = {
      method: request.method,
      path: request.url,
      statusCode,
      code,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };

    // Log based on severity
    if (statusCode >= 500) {
      // Server errors - always log with stack
      this.logger.error(
        `[${code}] ${message}`,
        exception instanceof Error ? exception.stack : undefined,
        JSON.stringify(logContext),
      );
    } else if (statusCode >= 400) {
      // Client errors - log as warning
      this.logger.warn(`[${code}] ${message}`, JSON.stringify(logContext));
    } else {
      // Other errors
      this.logger.log(`[${code}] ${message}`, JSON.stringify(logContext));
    }
  }

  /**
   * Check if exception is a Prisma error
   */
  private isPrismaError(
    exception: unknown,
  ): exception is Prisma.PrismaClientKnownRequestError {
    return (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      (typeof exception === 'object' &&
        exception !== null &&
        'code' in exception &&
        typeof exception.code === 'string' &&
        exception.code.startsWith('P'))
    );
  }

  /**
   * Extract target fields from Prisma error metadata
   */
  private extractPrismaTarget(target: unknown): string {
    if (Array.isArray(target)) {
      return target.join(', ');
    }
    if (typeof target === 'string') {
      return target;
    }
    if (typeof target === 'object' && target !== null) {
      return Object.values(target)
        .map((v) => String(v))
        .join(', ');
    }
    return 'unknown field';
  }
}
