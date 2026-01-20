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
import { TransformInterceptor } from '@/shared';

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

  // Config Swagger ----------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------
  const config = new DocumentBuilder()
    .setTitle('FPTU GitHub Tracking')
    .setDescription('The GitHub Tracking API description')
    .setVersion('1.0')
    .addTag('FPTU GitHub Tracking')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3000);
  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`🚀 pe_market_ecommerce running on port ${port}`);
}
