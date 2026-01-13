import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// bootstrap/http.bootstrap.ts

import { AppModule } from '@/app.module';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

export async function bootstrapHttp() {
  const app = await NestFactory.create(AppModule);

  // Config Lib
  // -------------------------------------------------------------------------------------------
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.enableShutdownHooks();

  // Config Swagger ----------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------
  const config = new DocumentBuilder()
    .setTitle('PE_MARKET_ECOMMERCE')
    .setDescription('The Ecommerce API description')
    .setVersion('1.0')
    .addTag('PEE')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3000);
  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`🚀 pe_market_ecommerce running on port ${port}`);
}
