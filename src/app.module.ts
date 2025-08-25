import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerPlatformModule } from './Modules/BloggerPlatform/bloggerPlatform.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'node:process';
import { AuthModule } from './Modules/AuthModule/auth.module';

@Module({
  imports: [
    BloggerPlatformModule,
    AuthModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || ''),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
