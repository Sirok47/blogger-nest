import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import {
  MeViewModel,
  UserDocument,
  UserInputModel,
} from '../users/users.models';
import { HashService } from '../../Crypto/bcrypt';
import { generateUuid } from 'src/Helpers/uuid';
import { TokenService } from '../../JWT/jwt.service';
import { addOneDay, oneSecond } from '../../../Helpers/dateHelpers';
import { config } from '../../../Settings/config';
import { UsersQueryRepo } from '../users/users.queryRepo';
import { UsersService } from '../users/users.service';
import { SessionRepository } from './sessions.repository';
import {
  Session,
  SessionDocument,
  type SessionModelType,
} from './sessions.models';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '../../Mailer/mailer.service';
import * as console from 'node:console';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private usersRepo: UsersRepository,
    private usersQueryRepo: UsersQueryRepo,
    private sessionRepo: SessionRepository,
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    private crypto: HashService,
    private jwt: TokenService,
    private mailer: MailerService,
  ) {}

  async logIn(
    searchTerm: string,
    password: string,
    reqMeta: { IP: string; userAgent: string },
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const user: UserDocument | null =
      await this.usersRepo.findByLoginOrEmail(searchTerm);
    if (!user) {
      return null;
    }
    const passHash: string | undefined = await this.usersRepo.retrievePassword(
      user._id.toString(),
    );
    if (!passHash) {
      return null;
    }
    if (!(await this.crypto.compareHash(password, passHash))) {
      return null;
    }

    const deviceId = generateUuid().toString();
    const { session, accessToken, refreshToken } = this.createNewSession(
      user._id.toString(),
      deviceId,
      reqMeta,
    );

    if (!(await this.sessionRepo.save(session))) {
      return null;
    }
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async logOut(token: string): Promise<boolean> {
    const { userId, deviceId, iat } = this.jwt.extractJWTPayload(token);
    if (
      !(await this.sessionRepo.checkPresenceInTheList(
        userId,
        deviceId,
        new Date(iat! * oneSecond).toISOString(),
      ))
    ) {
      return false;
    }
    return await this.sessionRepo.terminateSession(deviceId);
  }

  async refreshToken(
    token: string,
    reqMeta: { IP: string; userAgent: string },
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const { userId, deviceId, iat } = this.jwt.extractJWTPayload(token);
    if (
      !(await this.sessionRepo.checkPresenceInTheList(
        userId,
        deviceId,
        new Date(iat! * oneSecond).toISOString(),
      ))
    ) {
      return null;
    }

    const user: UserDocument | null = await this.usersRepo.findById(userId);
    if (!user) {
      return null;
    }

    const { session, accessToken, refreshToken } = this.createNewSession(
      user._id.toString(),
      deviceId,
      reqMeta,
    );
    await this.sessionRepo.refreshSession(session);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  private createNewSession(
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

  async registerWithEmailConf(user: UserInputModel): Promise<boolean> {
    const uuid: string = (await this.usersService.postOneUser(user))
      .confirmationData.confirmationCode;

    this.mailer
      .sendEmailWithConfirmationCode(user.email, uuid, 'code')
      .catch(console.error);

    return true;
  }

  async confirmEmail(code: string): Promise<boolean> {
    const userToConfirm: UserDocument | null =
      await this.usersRepo.findWithCode(code);
    if (!userToConfirm) {
      throw new Error('No such code');
    }
    if (userToConfirm.confirmationData.isConfirmed) {
      throw new Error('Already confirmed');
    }
    if (
      new Date().getTime() >
      userToConfirm.confirmationData.confirmationCodeExpDate.getTime()
    ) {
      throw new Error('Code expired');
    }
    userToConfirm.confirmationData.isConfirmed = true;
    return !!(await this.usersRepo.save(userToConfirm));
  }

  async resendConfirmationMail(email: string): Promise<boolean> {
    const userToSendTo: UserDocument | null =
      await this.usersRepo.findByLoginOrEmail(email);
    if (!userToSendTo) {
      throw new Error('No such email');
    }
    if (userToSendTo.confirmationData.isConfirmed) {
      throw new Error('Already confirmed');
    }
    const newCode = generateUuid();
    const result = await this.usersRepo.updateConfirmationCode(
      userToSendTo._id.toString(),
      newCode,
      addOneDay(new Date()),
    );
    if (!result) {
      return false;
    }
    await this.mailer.sendEmailWithConfirmationCode(email, newCode, 'code');
    return true;
  }

  async recoverPasswordWithEmail(email: string): Promise<boolean> {
    const userToSendTo: UserDocument | null =
      await this.usersRepo.findByLoginOrEmail(email);
    if (!userToSendTo || !userToSendTo.confirmationData.isConfirmed) {
      return true;
    }
    const newCode = generateUuid();
    const result = await this.usersRepo.updateConfirmationCode(
      userToSendTo._id.toString(),
      newCode,
      addOneDay(new Date()),
    );
    if (!result) {
      return false;
    }
    await this.mailer.sendEmailWithConfirmationCode(
      email,
      newCode,
      'recoveryCode',
    );
    return true;
  }

  async confirmPasswordChange(code: string, newPass: string): Promise<boolean> {
    const userToConfirm: UserDocument | null =
      await this.usersRepo.findWithCode(code);
    if (!userToConfirm || !userToConfirm.confirmationData.isConfirmed) {
      return false;
    }
    if (
      new Date().getTime() >
      userToConfirm.confirmationData.confirmationCodeExpDate.getTime()
    ) {
      return false;
    }
    return await this.usersRepo.changePassword(
      userToConfirm._id.toString(),
      await this.crypto.toHash(newPass),
    );
  }
}
