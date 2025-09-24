import { Injectable } from '@nestjs/common';
import { SessionDocument, SessionViewModel } from '../../sessions.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionsQueryRepoPSQL {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async getSessions(userId: string): Promise<SessionViewModel[]> {
    const sessions: SessionDocument[] = await this.dataSource.query(
      `
      SELECT * FROM "Sessions"
      WHERE "userId" = $1`,
      [userId],
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
