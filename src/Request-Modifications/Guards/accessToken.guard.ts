import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../../Modules/JWT/jwt.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private jwt: TokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Invalid authorization format. Expected "Bearer <token>"',
      );
    }

    if (!this.jwt.verifyToken(token)) {
      throw new UnauthorizedException();
    }
    request.params.token = token;
    return true;
  }
}
