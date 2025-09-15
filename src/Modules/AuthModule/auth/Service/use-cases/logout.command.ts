import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../../sessions/sessions.repository';
import { TokenService } from '../../../../JWT/jwt.service';
import { oneSecond } from '../../../../../Helpers/dateHelpers';

export class LogoutCommand {
  constructor(public readonly token: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly sessionRepo: SessionRepository,
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
