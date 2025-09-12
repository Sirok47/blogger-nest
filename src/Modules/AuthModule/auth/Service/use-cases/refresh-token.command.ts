import {
  Session,
  SessionDocument,
  type SessionModelType,
} from '../../sessions.models';
import { oneSecond } from '../../../../../Helpers/dateHelpers';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { SessionRepository } from '../../sessions.repository';
import { TokenService } from '../../../../JWT/jwt.service';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../../../users/users.models';
import { AuthService } from '../auth.service';

export class RefreshTokenCommand {
  constructor(
    public readonly token: string,
    public readonly reqMeta: { IP: string; userAgent: string },
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepo: UsersRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly jwt: TokenService,
    @InjectModel(Session.name) private readonly SessionModel: SessionModelType,
  ) {}

  async execute({ token, reqMeta }: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const { userId, deviceId, iat } = this.jwt.extractJWTPayload(token);
    if (
      !(await this.sessionRepo.checkPresenceInTheList(
        //TODO
        userId,
        deviceId,
        new Date(iat! * oneSecond).toISOString(),
      ))
    ) {
      return null;
    }

    const user: UserDocument | null = await this.usersRepo.findById(userId);
    if (!user) {
      return null;
    }

    const { session, accessToken, refreshToken } =
      this.authService.createNewSession(user._id.toString(), deviceId, reqMeta);
    await this.sessionRepo.refreshSession(session);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
