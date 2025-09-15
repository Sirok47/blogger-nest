import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { SessionRepository } from '../../../sessions/sessions.repository';
import { HashService } from 'src/Modules/Crypto/bcrypt';
import {
  Session,
  type SessionModelType,
} from '../../../sessions/sessions.models';
import { InjectModel } from '@nestjs/mongoose';
import { generateUuid } from '../../../../../Helpers/uuid';
import { UserDocument } from '../../../users/users.models';
import { AuthService } from '../auth.service';

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
    private readonly usersRepo: UsersRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly crypto: HashService,
    private readonly authService: AuthService,
    @InjectModel(Session.name) private readonly SessionModel: SessionModelType,
  ) {}

  async execute({ searchTerm, password, reqMeta }: LoginCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const user: UserDocument | null =
      await this.usersRepo.findByLoginOrEmail(searchTerm);
    if (!user) {
      return null;
    }
    const passHash: string | undefined = await this.usersRepo.retrievePassword(
      user._id.toString(),
    );
    if (!passHash) {
      return null;
    }
    if (!(await this.crypto.compareHash(password, passHash))) {
      return null;
    }

    const deviceId = generateUuid().toString();
    const { session, accessToken, refreshToken } =
      this.authService.createNewSession(user._id.toString(), deviceId, reqMeta);

    if (!(await this.sessionRepo.save(session))) {
      return null;
    }
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
