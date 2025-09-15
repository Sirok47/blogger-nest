import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { initMailer } from './Modules/Mailer/mailer.service';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import { GlobalHTTPExceptionFilter } from './Request-Modifications/Exception-Filters/globalHTTP';
import { CustomBadRequestExceptionFilter } from './Request-Modifications/Exception-Filters/custom400';
import { CustomTrimAndErrLimitPipe } from './Request-Modifications/Pipes/global-trim.pipe';

async function bootstrap(): Promise<void> {
  await initMailer();
  const app: INestApplication = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new CustomTrimAndErrLimitPipe());
  app.useGlobalFilters(
    new GlobalHTTPExceptionFilter(),
    new CustomBadRequestExceptionFilter(),
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap().catch(console.error);
