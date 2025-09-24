import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokenService } from '../../../../JWT/jwt.service';
import { oneSecond } from '../../../../../Helpers/dateHelpers';
import { type ISessionsRepository, SESSIONS_REPOSITORY } from '../auth.service';
import { Inject } from '@nestjs/common';

export class LogoutCommand {
  constructor(public readonly token: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    @Inject(SESSIONS_REPOSITORY)
    private readonly sessionRepo: ISessionsRepository,
    private readonly jwt: TokenService,
  ) {}

  async execute({ token }: LogoutCommand): Promise<boolean> {
    const { userId, deviceId, iat } = this.jwt.extractJWTPayload(token);
    if (
      !(await this.sessionRepo.checkPresenceInTheList(
        //TODO
        userId,
        deviceId,
        new Date(iat! * oneSecond).toISOString(),
      ))
    ) {
      return false;
    }
    return await this.sessionRepo.terminateSession(deviceId);
  }
}
