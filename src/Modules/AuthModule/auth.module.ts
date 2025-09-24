import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users/users.controller';
import {
  USERS_QUERY_REPO,
  USERS_REPOSITORY,
  UsersService,
} from './users/Service/users.service';
import { User, UserSchema } from './users/users.models';
import { AuthController } from './auth/auth.controller';
import {
  AuthService,
  SESSIONS_QUERY_REPO,
  SESSIONS_REPOSITORY,
} from './auth/Service/auth.service';
import { TokenModule } from '../JWT/jwt.module';
import { MailerModule } from '../Mailer/mailer.module';
import { HashModule } from '../Crypto/crypto.module';
import { Session, SessionSchema } from './sessions/sessions.models';
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
import { DeleteAllButOneSessionsHandler } from './sessions/Service/use-cases/terminate-all-but-one-session.command';
import { DeleteSessionHandler } from './sessions/Service/use-cases/terminate-one-session.command';
import { SessionsController } from './sessions/sessions.controller';
import { SessionsRepositoryPSQL } from './sessions/Repository/PostgreSQL/sessions.repository.psql';
import { SessionsQueryRepoPSQL } from './sessions/Repository/PostgreSQL/sessions.queryRepo.psql';
import { UsersQueryRepoPSQL } from './users/Repository/PostgreSQL/users.queryRepo.psql';
import { UsersRepositoryPSQL } from './users/Repository/PostgreSQL/users.repository.psql';

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
const SessionCommandHandlers = [
  DeleteAllButOneSessionsHandler,
  DeleteSessionHandler,
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
  controllers: [UsersController, AuthController, SessionsController],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepositoryPSQL,
    },
    {
      provide: USERS_QUERY_REPO,
      useClass: UsersQueryRepoPSQL,
    },
    AuthService,
    {
      provide: SESSIONS_REPOSITORY,
      useClass: SessionsRepositoryPSQL,
    },
    {
      provide: SESSIONS_QUERY_REPO,
      useClass: SessionsQueryRepoPSQL,
    },
    ...UserCommandHandlers,
    ...AuthCommandHandlers,
    ...SessionCommandHandlers,
  ],
  exports: [USERS_REPOSITORY, SESSIONS_REPOSITORY],
})
export class AuthModule {}
