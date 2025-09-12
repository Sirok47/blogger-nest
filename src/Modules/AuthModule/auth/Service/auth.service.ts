import { Injectable } from '@nestjs/common';
import { MeViewModel, UserDocument } from '../../users/users.models';
import { TokenService } from '../../../JWT/jwt.service';
import { oneSecond } from '../../../../Helpers/dateHelpers';
import { config } from '../../../../Settings/config';
import { UsersQueryRepo } from '../../users/users.queryRepo';
import {
  Session,
  SessionDocument,
  type SessionModelType,
} from '../sessions.models';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersQueryRepo: UsersQueryRepo,
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    private jwt: TokenService,
  ) {}

  createNewSession(
    userId: string,
    deviceId: string,
    reqMeta: { IP: string; userAgent: string },
  ): { session: SessionDocument; accessToken: string; refreshToken: string } {
    const accessToken = this.jwt.createJWT(
      { userId: userId },
      config.accessTokenLifeSpan,
    );
    const refreshToken: string = this.jwt.createJWT(
      { userId: userId, deviceId: deviceId },
      config.refreshTokenLifeSpan,
    );

    const session: SessionDocument = new this.SessionModel({
      ip: reqMeta.IP,
      title: reqMeta.userAgent || 'Unknown device',
      deviceId: deviceId,
      userId: userId,
      lastActiveDate: new Date(
        this.jwt.extractJWTPayload(refreshToken).iat! * oneSecond,
      ).toISOString(),
      expDate: new Date(
        this.jwt.extractJWTPayload(refreshToken).exp! * oneSecond,
      ),
    });
    return {
      session: session,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async aboutMe(token: string): Promise<MeViewModel | null> {
    const id = this.jwt.extractJWTPayload(token).userId as string;
    if (!id) return null;
    const user: UserDocument | null = await this.usersQueryRepo.findOneById(id);
    if (!user) return null;
    return user.mapToMeViewModel();
  }
}
