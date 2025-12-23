import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from '../../src/Settings/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import cookieParser from 'cookie-parser';
import { CustomTrimAndErrLimitPipe } from '../../src/Request-Modifications/Pipes/global-trim.pipe';
import { GlobalHTTPExceptionFilter } from '../../src/Request-Modifications/Exception-Filters/globalHTTP';
import { CustomBadRequestExceptionFilter } from '../../src/Request-Modifications/Exception-Filters/custom400';
import { DynamicModule, ForwardReference, Type } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

export async function initTestingModule(
  modules: (
    | Type<any>
    | ForwardReference<any>
    | DynamicModule
    | Promise<DynamicModule>
  )[],
): Promise<TestingModule> {
  return await Test.createTestingModule({
    imports: [
      MongooseModule.forRoot(config.MONGODB_URI, { dbName: 'blogger_nest' }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: config.PSQL_HOST,
        port: config.PSQL_PORT,
        username: config.PSQL_USERNAME,
        password: config.PSQL_PASSWORD,
        database: config.PSQL_DB + 'test',
        autoLoadEntities: true,
        synchronize: true,
        url: config.PSQL_CONNECTION_STRING,
      }),
      AppModule,
      ...modules,
    ],
  }).compile();
}

export async function startTestServer(moduleRef: TestingModule) {
  const app: NestExpressApplication = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(new CustomTrimAndErrLimitPipe());
  app.useGlobalFilters(
    new GlobalHTTPExceptionFilter(),
    new CustomBadRequestExceptionFilter(),
  );
  app.set('trust proxy', 1);

  await app.init();
  const server = app.getHttpServer();
  return { app, server };
}
