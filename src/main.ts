import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initMailer } from './Modules/Mailer/mailer.service';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import { GlobalHTTPExceptionFilter } from './Request-Modifications/Exception-Filters/globalHTTP';
import { CustomBadRequestExceptionFilter } from './Request-Modifications/Exception-Filters/custom400';
import { CustomTrimAndErrLimitPipe } from './Request-Modifications/Pipes/global-trim.pipe';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<void> {
  await initMailer();
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new CustomTrimAndErrLimitPipe());
  app.useGlobalFilters(
    new GlobalHTTPExceptionFilter(),
    new CustomBadRequestExceptionFilter(),
  );
  app.set('trust proxy', 1);
  await app.listen(process.env.PORT || 3000);
}

bootstrap().catch(console.error);
