import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// bootstrap/http.bootstrap.ts

import { AppModule } from '@/app.module';
import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { LoggingInterceptor } from '@/shared/interceptors/logging.interceptor';
import { TransformInterceptor } from '@/shared/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '@/shared/filters/global-exception.filter';

export async function bootstrapHttp() {
  const app = await NestFactory.create(AppModule);

  // Config Lib
  // -------------------------------------------------------------------------------------------
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());

  app.enableShutdownHooks();

  const reflector = app.get(Reflector);

  // Config Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const formattedErrors = validationErrors.map((error) => ({
          field: error.property,
          message: Object.values(
            error.constraints as Record<string, string>,
          ).join(),
        }));
        return new BadRequestException({
          statusCode: 400,
          messages: formattedErrors,
          error: 'Bad Request',
        });
      },
    }),
  );
  // Interceptor
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(reflector),
    new ClassSerializerInterceptor(reflector),
  );

  // Global Exception Filter for DDD-compliant error handling
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Config Swagger ----------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------
  const config = new DocumentBuilder()
    .setTitle('FPTU GitHub Tracking')
    .setDescription('The GitHub Tracking API description')
    .setVersion('1.0')
    .addBearerAuth() // Nên thêm để test JWT sau này
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Giữ login khi F5 trang
    },
    useGlobalPrefix: false, // QUAN TRỌNG: Swagger sẽ chạy tại /docs thay vì /api/v1/docs
  });
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3000);
  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`🚀 pe_market_ecommerce running on port ${port}`);
}
