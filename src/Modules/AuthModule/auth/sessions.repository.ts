import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionDocument,
  type SessionModelType,
} from './sessions.models';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}
  async getSessionByDeviceId(deviceId: string): Promise<Session | null> {
    return this.SessionModel.findOne({ deviceId: deviceId });
  }

  async save(session: SessionDocument) {
    return !!(await session.save());
  }

  async refreshSession(newSession: Session): Promise<boolean> {
    return (
      await this.SessionModel.updateOne(
        { userId: newSession.userId, deviceId: newSession.deviceId },
        { $set: { ...newSession } },
      )
    ).acknowledged;
  }

  async checkPresenceInTheList(
    userId: string,
    deviceId: string,
    issuedAt: string,
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
