import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { initMailer } from './Modules/Mailer/mailer.service';
import 'reflect-metadata';
import { GlobalHTTPExceptionFilter } from './Exception-Filters/globalHTTP';
import { CustomBadRequestExceptionFilter } from './Exception-Filters/custom400';

async function bootstrap(): Promise<void> {
  await initMailer();
  const app: INestApplication = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(
    new GlobalHTTPExceptionFilter(),
    new CustomBadRequestExceptionFilter(),
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap().catch(console.error);
