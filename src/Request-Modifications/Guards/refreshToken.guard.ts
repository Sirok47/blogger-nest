import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../../Modules/JWT/jwt.service';
import { oneSecond } from '../../Helpers/dateHelpers';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwt: TokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    try {
      const token = req.cookies.refreshToken as string;
      const { userId, deviceId, exp } = this.jwt.extractJWTPayload(token);
      if (!userId || !deviceId || !exp || exp * oneSecond < Date.now()) {
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
