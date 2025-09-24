import { Inject, Injectable } from '@nestjs/common';
import {
  MeViewModel,
  UserDocument,
  UserViewModel,
} from '../../users/users.models';
import { TokenService } from '../../../JWT/jwt.service';
import { oneSecond } from '../../../../Helpers/dateHelpers';
import { config } from '../../../../Settings/config';
import {
  Session,
  SessionDocument,
  type SessionModelType,
  SessionViewModel,
} from '../../sessions/sessions.models';
import { InjectModel } from '@nestjs/mongoose';
import {
  type IUsersQueryRepo,
  USERS_QUERY_REPO,
} from '../../users/Service/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_QUERY_REPO)
    private usersQueryRepo: IUsersQueryRepo,
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
    const user: MeViewModel | null = await this.usersQueryRepo.meView(id);
    if (!user) return null;
    return user;
  }
}

export interface ISessionsRepository {
  getSessionByDeviceId(deviceId: string): Promise<Session | null>;

  save(session: SessionDocument);

  refreshSession(newSession: SessionDocument): Promise<boolean>;

  checkPresenceInTheList(
    userId: string,
    deviceId: string,
    issuedAt: string,
  ): Promise<boolean>;

  terminateAllButOne(userId: string, deviceId: string): Promise<boolean>;

  terminateSession(deviceId: string): Promise<boolean>;

  deleteAll(): Promise<void>;
}

export const SESSIONS_REPOSITORY = Symbol('ISessionsRepository');

export interface ISessionsQueryRepo {
  getSessions(userId: string): Promise<SessionViewModel[]>;
}

export const SESSIONS_QUERY_REPO = Symbol('ISessionsQueryRepo');
