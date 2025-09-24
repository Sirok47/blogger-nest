import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerPlatformModule } from './Modules/BloggerPlatform/bloggerPlatform.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './Modules/AuthModule/auth.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './Settings/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    BloggerPlatformModule,
    AuthModule,
    MongooseModule.forRoot(config.MONGODB_URI, { dbName: 'blogger_nest' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.PSQL_HOST,
      port: config.PSQL_PORT,
      username: config.PSQL_USERNAME,
      password: config.PSQL_PASSWORD,
      database: config.PSQL_DB,
      autoLoadEntities: false,
      synchronize: false,
      url: config.PSQL_CONNECTION_STRING,
    }),
    CqrsModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 5,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
