import { Injectable } from '@nestjs/common';
import {
  Session,
  SessionDocument,
  type SessionModelType,
  SessionViewModel,
} from '../../sessions.models';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SessionsQueryRepo {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}
  async getSessions(userId: string): Promise<SessionViewModel[]> {
    const sessions: SessionDocument[] = await this.SessionModel.find({
      userId: userId,
    }).exec();
    const result: SessionViewModel[] = [];
    for (const session of sessions) {
      result.push({
        ip: session.ip,
        title: session.title,
        lastActiveDate: session.lastActiveDate,
        deviceId: session.deviceId,
      });
    }
    return result;
  }
}
