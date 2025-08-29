import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerPlatformModule } from './Modules/BloggerPlatform/bloggerPlatform.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './Modules/AuthModule/auth.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './Settings/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    BloggerPlatformModule,
    AuthModule,
    MongooseModule.forRoot(config.MONGODB_URI, {
      dbName: 'blogger_nest',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
