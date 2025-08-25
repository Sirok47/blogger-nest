import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerPlatformModule } from './Modules/BloggerPlatform/bloggerPlatform.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'node:process';
import { AuthModule } from './Modules/AuthModule/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BloggerPlatformModule,
    AuthModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || '', {
      dbName: 'blogger_nest',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
