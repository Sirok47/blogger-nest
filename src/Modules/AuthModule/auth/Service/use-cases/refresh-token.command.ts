import {
  Session,
  type SessionModelType,
} from '../../../sessions/sessions.models';
import { oneSecond } from '../../../../../Helpers/dateHelpers';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../users/Service/users.service';
import { TokenService } from '../../../../JWT/jwt.service';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../../../users/users.models';
import {
  AuthService,
  type ISessionsRepository,
  SESSIONS_REPOSITORY,
} from '../auth.service';
import { Inject } from '@nestjs/common';

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
    @Inject(USERS_REPOSITORY)
    private readonly usersRepo: IUsersRepository,
    @Inject(SESSIONS_REPOSITORY)
    private readonly sessionRepo: ISessionsRepository,
    private readonly jwt: TokenService,
    @InjectModel(Session.name) private readonly SessionModel: SessionModelType,
  ) {}

  async execute({ token, reqMeta }: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const { userId, deviceId } = this.jwt.extractJWTPayload(token);

    const user: UserDocument | null = await this.usersRepo.findById(userId);
    if (!user) {
      return null;
    }

    const { session, accessToken, refreshToken } =
      this.authService.createNewSession(user.id, deviceId, reqMeta);
    await this.sessionRepo.refreshSession(session);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
