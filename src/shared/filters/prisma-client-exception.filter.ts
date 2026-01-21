import { Prisma } from '@/generated/prisma/client';
import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const message = exception.message.replaceAll('\n', '');

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;

        const meta = exception.meta;
        const target = meta?.target;

        let fieldNames: string;

        // 1. Nếu là mảng string (Trường hợp phổ biến nhất)
        if (Array.isArray(target)) {
          fieldNames = target.join(', ');
        }
        // 2. Nếu là một chuỗi đơn lẻ
        else if (typeof target === 'string') {
          fieldNames = target;
        }
        // 3. Nếu là Object (Tránh [object Object])
        else if (typeof target === 'object' && target !== null) {
          // Lấy tất cả giá trị của Object và nối lại, hoặc lấy Key nếu cần
          fieldNames = Object.values(target)
            .map((v) => String(v))
            .join(', ');
        }
        // 4. "Cứu cánh" cuối cùng: Parse từ Message nếu Meta bị lỗi do Transaction
        else {
          const match = exception.message.match(/fields: \(`(.*?)`\)/);
          fieldNames = match ? match[1] : 'trường đã tồn tại';
        }

        response.status(status).json({
          statusCode: status,
          message: `Unique constraint failed on the fields: ${fieldNames} `,
          error: 'Conflict',
        });
        break;
      }
      case 'P2025': {
        // Record not found (Không tìm thấy dòng dữ liệu)
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message: 'Not Found ',
          error: 'Not Found',
        });
        break;
      }
      case 'P2003': {
        // Foreign key constraint failed (Lỗi khóa ngoại)
        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          message: 'Invalid foreign key constraint',
          error: 'Bad Request',
        });
        break;
      }
      default:
        // Các lỗi Prisma khác chưa được handle cụ thể
        this.logger.error(`Prisma Error: ${exception.code} - ${message}`);
        super.catch(exception, host);
        break;
    }
  }
}
