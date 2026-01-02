import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../../Modules/JWT/jwt.service';
import { Request } from 'express';

@Injectable()
export class OptionalAccessTokenGuardGuard implements CanActivate {
  constructor(private jwt: TokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const [authType, token] = req.get('Authorization')!.split(' ');
    if (authType !== 'Bearer') {
      return true;
    }
    const res = this.jwt.extractJWTPayload(token);
    if (!res) throw new UnauthorizedException();
    req.params.userId = res.userId;
    return true;
  }
}
//TODO:Check if session is still active
