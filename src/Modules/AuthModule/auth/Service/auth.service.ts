import { Inject, Injectable } from '@nestjs/common';
import { MeViewModel } from '../../users/users.models';
import { TokenService } from '../../../JWT/jwt.service';
import { oneSecond } from '../../../../Helpers/dateHelpers';
import { config } from '../../../../Settings/config';
import { Session, SessionViewModel } from '../../sessions/sessions.models';
import {
  type IUsersQueryRepo,
  USERS_QUERY_REPO,
} from '../../users/Service/users.service';

export interface ISessionsRepository {
  create(session: Session): Session;

  getSessionByDeviceId(deviceId: string): Promise<Session | null>;

  save(session: Session): Promise<Session>;

  refreshSession(newSession: Session): Promise<boolean>;

  checkPresenceInTheList(
    userId: string,
    deviceId: string,
    issuedAt: Date,
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

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_QUERY_REPO)
    private usersQueryRepo: IUsersQueryRepo,
    private jwt: TokenService,
    @Inject(SESSIONS_REPOSITORY)
    private sessionRepository: ISessionsRepository,
  ) {}

  createNewSession(
    userId: string,
    deviceId: string,
    reqMeta: { IP: string; userAgent: string },
  ): { session: Session; accessToken: string; refreshToken: string } {
    const accessToken = this.jwt.createJWT(
      { userId: userId },
      config.accessTokenLifeSpan,
    );
    const refreshToken: string = this.jwt.createJWT(
      { userId: userId, deviceId: deviceId },
      config.refreshTokenLifeSpan,
    );

    const session: Session = this.sessionRepository.create({
      ip: reqMeta.IP,
      title: reqMeta.userAgent || 'Unknown device',
      deviceId: deviceId,
      userId: userId,
      lastActiveDate: new Date(
        this.jwt.extractJWTPayload(refreshToken).iat! * oneSecond,
      ),
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
