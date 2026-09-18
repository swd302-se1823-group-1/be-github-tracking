import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response as Res } from 'express';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_KEY } from '@/shared/decorators/response-message.decorator';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, any>;
}

export interface ResponseWithMeta<T> {
  data: T;
  meta: Record<string, any>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  constructor(private readonly reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const responseMessage = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );
    return next.handle().pipe(
      map((data: T | ResponseWithMeta<T>) => {
        const res = context.switchToHttp().getResponse<Res>();
        const statusCode = res.statusCode;

        // Handle case when response has meta
        if (this.isResponseWithMeta(data)) {
          return {
            statusCode,
            data: data.data,
            meta: data.meta,
            message: responseMessage,
            success: true,
          };
        }

        // Default case without meta
        return { statusCode, data, message: responseMessage, success: true };
      }),
    );
  }

  private isResponseWithMeta<T>(
    data: T | ResponseWithMeta<T>,
  ): data is ResponseWithMeta<T> {
    return (
      data !== null &&
      typeof data === 'object' &&
      'meta' in data &&
      'data' in data
    );
  }
}
