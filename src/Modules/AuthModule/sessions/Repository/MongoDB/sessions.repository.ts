import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionDocument,
  type SessionModelType,
  SessionMongo,
} from '../../sessions.entity';
import { ISessionsRepository } from '../../../auth/Service/auth.service';

@Injectable()
export class SessionsRepository implements ISessionsRepository {
  constructor(
    @InjectModel(SessionMongo.name) private SessionModel: SessionModelType,
  ) {}

  create(session: Session): Session {
    return this.SessionModel.CreateDocument(session);
  }

  async getSessionByDeviceId(deviceId: string): Promise<Session | null> {
    return this.SessionModel.findOne({ deviceId: deviceId });
  }

  async save(session: SessionDocument): Promise<SessionDocument> {
    return await session.save();
  }

  async refreshSession(newSession: SessionDocument): Promise<boolean> {
    const session: SessionDocument | null = await this.SessionModel.findOne({
      userId: newSession.userId,
      deviceId: newSession.deviceId,
    });
    if (!session) {
      return false;
    }
    session.lastActiveDate = newSession.lastActiveDate;
    session.expDate = newSession.expDate;
    return !!(await session.save());
  }

  async checkPresenceInTheList(
    userId: string,
    deviceId: string,
    issuedAt: Date,
  ): Promise<boolean> {
    return !!(await this.SessionModel.findOne({
      userId: userId,
      deviceId: deviceId,
      lastActiveDate: issuedAt,
    }));
  }

  async terminateAllButOne(userId: string, deviceId: string): Promise<boolean> {
    return (
      await this.SessionModel.deleteMany({
        userId: userId,
        deviceId: { $ne: deviceId },
      })
    ).acknowledged;
  }

  async terminateSession(deviceId: string): Promise<boolean> {
    return (await this.SessionModel.deleteMany({ deviceId: deviceId }))
      .acknowledged;
  }

  async deleteAll(): Promise<void> {
    await this.SessionModel.deleteMany();
  }
}
