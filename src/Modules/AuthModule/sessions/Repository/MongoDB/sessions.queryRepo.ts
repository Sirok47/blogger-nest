import { Injectable } from '@nestjs/common';
import {
  SessionDocument,
  type SessionModelType,
  SessionMongo,
  SessionViewModel,
} from '../../sessions.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ISessionsQueryRepo } from '../../../auth/Service/auth.service';

@Injectable()
export class SessionsQueryRepo implements ISessionsQueryRepo {
  constructor(
    @InjectModel(SessionMongo.name) private SessionModel: SessionModelType,
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
