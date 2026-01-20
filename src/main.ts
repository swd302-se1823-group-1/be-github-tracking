import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register global exception filter for DDD-compliant error handling
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
