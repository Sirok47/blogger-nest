import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { config } from '../../Settings/config';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [scheme, encoded] = authHeader.split(' ');

    if (scheme !== 'Basic' || !encoded) {
      throw new UnauthorizedException(
        'Invalid authorization format. Expected "Basic <base64>"',
      );
    }

    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    if (
      username !== config.ADMIN_USERNAME ||
      password !== config.ADMIN_PASSWORD
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }
}
