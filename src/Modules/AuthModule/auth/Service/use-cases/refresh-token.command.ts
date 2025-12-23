import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../users/Service/users.service';
import { TokenService } from '../../../../JWT/jwt.service';
import { User } from '../../../users/users.entity';
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
  ) {}

  async execute({ token, reqMeta }: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const { userId, deviceId } = this.jwt.extractJWTPayload(token);

    const user: User | null = await this.usersRepo.findById(userId);
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
