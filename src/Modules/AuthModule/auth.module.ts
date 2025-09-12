import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users/users.controller';
import { UsersRepository } from './users/users.repository';
import { UsersQueryRepo } from './users/users.queryRepo';
import { UsersService } from './users/Service/users.service';
import { User, UserSchema } from './users/users.models';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/Service/auth.service';
import { SessionRepository } from './auth/sessions.repository';
import { TokenModule } from '../JWT/jwt.module';
import { MailerModule } from '../Mailer/mailer.module';
import { HashModule } from '../Crypto/crypto.module';
import { Session, SessionSchema } from './auth/sessions.models';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteUserHandler } from './users/Service/use-cases/deleteUserCommand';
import { LoginHandler } from './auth/Service/use-cases/login.command';
import { CreateUserHandler } from './users/Service/use-cases/createUserCommand';
import { LogoutHandler } from './auth/Service/use-cases/logout.command';
import { RefreshTokenHandler } from './auth/Service/use-cases/refresh-token.command';
import { RegisterUserHandler } from './auth/Service/use-cases/registration.command';
import { ResendConfirmationEmailHandler } from './auth/Service/use-cases/resend-email.command';
import { ConfirmEmailHandler } from './auth/Service/use-cases/email-confirmation.command';
import { RecoverPasswordHandler } from './auth/Service/use-cases/recover-password.command';
import { ConfirmPasswordChangeHandler } from './auth/Service/use-cases/new-password.command';

const UserCommandHandlers = [CreateUserHandler, DeleteUserHandler];
const AuthCommandHandlers = [
  LoginHandler,
  LogoutHandler,
  RefreshTokenHandler,
  RegisterUserHandler,
  ConfirmEmailHandler,
  ResendConfirmationEmailHandler,
  RecoverPasswordHandler,
  ConfirmPasswordChangeHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
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
    ...UserCommandHandlers,
    ...AuthCommandHandlers,
  ],
  exports: [UsersRepository, SessionRepository],
})
export class AuthModule {}
