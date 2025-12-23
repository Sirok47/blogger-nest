import { Injectable } from '@nestjs/common';
import { SessionPSQL, SessionViewModel } from '../../sessions.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ISessionsQueryRepo } from '../../../auth/Service/auth.service';

@Injectable()
export class SessionsQueryRepoRawPSQL implements ISessionsQueryRepo {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getSessions(userId: string): Promise<SessionViewModel[]> {
    const sessions: SessionPSQL[] = await this.dataSource.query(
      `
      SELECT id, "IP" as ip, title, "lastActiveDate", "expDate", "deviceId", "userId" FROM "Sessions"
      WHERE "userId" = $1
      AND "expDate" > $2`,
      [userId, new Date()],
    );
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
