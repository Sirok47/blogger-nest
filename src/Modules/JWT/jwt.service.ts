//TODO: nestjs/
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../../Settings/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenService {
  createJWT(payload: object, expTime: number = config.accessTokenLifeSpan) {
    return jwt.sign(payload, config.SECRET_KEY, { expiresIn: expTime });
  }

  verifyToken(token: string): boolean {
    try {
      jwt.verify(token, config.SECRET_KEY);
      return true;
    } catch (_) {
      return false;
    }
  }

  extractJWTPayload(token: string): JwtPayload {
    const payload = jwt.decode(token) as JwtPayload;
    if (!payload) {
      return {};
    }
    return payload;
  }
}
