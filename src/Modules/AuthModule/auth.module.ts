import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users/users.controller';
import { UsersRepository } from './users/users.repository';
import { UsersQueryRepo } from './users/users.queryRepo';
import { UsersService } from './users/users.service';
import { User, UserSchema } from './users/users.models';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { SessionRepository } from './auth/sessions.repository';
import { TokenModule } from '../JWT/jwt.module';
import { MailerModule } from '../Mailer/mailer.module';
import { HashModule } from '../Crypto/crypto.module';
import { Session, SessionSchema } from './auth/sessions.models';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    TokenModule,
    MailerModule,
    HashModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersQueryRepo,
    UsersRepository,
    AuthService,
    SessionRepository,
  ],
  exports: [UsersRepository, SessionRepository],
})
export class AuthModule {}
