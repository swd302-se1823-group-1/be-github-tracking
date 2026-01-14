import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, tap } from 'rxjs';

export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, path } = request;

    const query = request.query ?? {};
    const params = request.params ?? {};
    const body: unknown = request.body || undefined;

    const start = Date.now();

    const formatRequest = `[Request] ${method} ${path} - body: ${JSON.stringify(body)} - query: ${JSON.stringify(
      query,
    )} - params: ${JSON.stringify(params)}  `;

    this.logger.log(formatRequest);

    return next.handle().pipe(
      tap(() => {
        const formatResponse = `[Response] ${method} ${path} - statusCode: ${response.statusCode}`;
        const duration = Date.now() - start;
        this.logger.log(`${formatResponse} - duration: ${duration}ms`);
      }),
      catchError((err) => {
        const formatError = `[Error] -  ${method} ${path} - statusCode: ${
          response.statusCode
        } - message: ${err || 'N/A'})}`;
        const duration = Date.now() - start;
        this.logger.error(`${formatError} - duration: ${duration}ms`);
        throw err;
      }),
    );
  }
}
