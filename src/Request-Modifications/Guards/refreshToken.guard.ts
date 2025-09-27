import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../../Modules/JWT/jwt.service';
import { oneSecond } from '../../Helpers/dateHelpers';
import {
  type ISessionsRepository,
  SESSIONS_REPOSITORY,
} from '../../Modules/AuthModule/auth/Service/auth.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwt: TokenService,
    @Inject(SESSIONS_REPOSITORY)
    private sessionRepo: ISessionsRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    try {
      const token = req.cookies.refreshToken as string;
      const { userId, deviceId, iat, exp } = this.jwt.extractJWTPayload(token);
      if (
        !userId ||
        !deviceId ||
        !iat ||
        !exp ||
        exp * oneSecond < Date.now()
      ) {
        throw new UnauthorizedException();
      }
      if (
        !(await this.sessionRepo.checkPresenceInTheList(
          userId,
          deviceId,
          new Date(iat * oneSecond),
        ))
      ) {
        throw new UnauthorizedException();
      }
      req.params.userId = userId as string;
      req.params.deviceId = deviceId as string;
      return true;
    } catch (_) {
      throw new UnauthorizedException();
    }
  }
}
