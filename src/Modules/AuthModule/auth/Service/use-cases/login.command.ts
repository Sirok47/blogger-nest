import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../users/Service/users.service';
import { HashService } from 'src/Modules/Crypto/bcrypt';
import { generateUuid } from '../../../../../Helpers/uuid';
import { User } from '../../../users/users.models';
import {
  AuthService,
  type ISessionsRepository,
  SESSIONS_REPOSITORY,
} from '../auth.service';
import { Inject } from '@nestjs/common';

export class LoginCommand {
  constructor(
    public readonly searchTerm: string,
    public readonly password: string,
    public readonly reqMeta: { IP: string; userAgent: string },
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepo: IUsersRepository,
    @Inject(SESSIONS_REPOSITORY)
    private readonly sessionRepo: ISessionsRepository,
    private readonly crypto: HashService,
    private readonly authService: AuthService,
  ) {}

  async execute({ searchTerm, password, reqMeta }: LoginCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const user: User | null =
      await this.usersRepo.findByLoginOrEmail(searchTerm);
    if (!user) {
      return null;
    }
    const passHash: string | undefined = await this.usersRepo.retrievePassword(
      user.id,
    );
    if (!passHash) {
      return null;
    }
    if (!(await this.crypto.compareHash(password, passHash))) {
      return null;
    }

    const deviceId = generateUuid().toString();
    const { session, accessToken, refreshToken } =
      this.authService.createNewSession(user.id, deviceId, reqMeta);
    if (!(await this.sessionRepo.save(session))) {
      return null;
    }
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
