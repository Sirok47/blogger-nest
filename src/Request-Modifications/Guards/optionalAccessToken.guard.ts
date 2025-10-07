import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenService } from '../../Modules/JWT/jwt.service';
import { Request } from 'express';

@Injectable()
export class OptionalAccessTokenGuardGuard implements CanActivate {
  constructor(private jwt: TokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    try {
      const [authType, token] = req.get('Authorization')!.split(' ');
      if (authType !== 'Bearer') {
        throw new Error();
      }
      req.params.userId = this.jwt.extractJWTPayload(token).userId as string;
    } catch (_) {
      // optional so no restrictions
    }
    return true;
  }
}
//TODO:Check if session is still active
