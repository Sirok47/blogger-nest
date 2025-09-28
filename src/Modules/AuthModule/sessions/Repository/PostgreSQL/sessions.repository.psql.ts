import { Injectable } from '@nestjs/common';
import { Session, SessionDocument } from '../../sessions.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ISessionsRepository } from '../../../auth/Service/auth.service';

@Injectable()
export class SessionsRepositoryPSQL implements ISessionsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getSessionByDeviceId(deviceId: string): Promise<Session | null> {
    const result = await this.dataSource.query<SessionDocument[]>(
      `
      SELECT * FROM "Sessions" 
      WHERE "deviceId" = $1`,
      [deviceId],
    );
    if (result.length !== 1) {
      return null;
    }
    return result[0];
  }

  async save(session: SessionDocument) {
    return (
      await this.dataSource.query<SessionDocument[]>(
        `INSERT INTO "Sessions"
            ("IP", title, "lastActiveDate", "expDate", "deviceId", "userId", "id")
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,
        [
          session.ip,
          session.title,
          session.lastActiveDate,
          session.expDate,
          session.deviceId,
          session.userId,
          session.id,
        ],
      )
    )[0];
  }

  async refreshSession(newSession: SessionDocument): Promise<boolean> {
    const session: SessionDocument[] = await this.dataSource.query<
      SessionDocument[]
    >(
      `
        SELECT id FROM "Sessions" 
        WHERE "deviceId" = $1 
        AND "userId" = $2`,
      [newSession.deviceId, newSession.userId],
    );
    if (!session || session.length !== 1) {
      return false;
    }
    session[0].lastActiveDate = newSession.lastActiveDate;
    session[0].expDate = newSession.expDate;
    return !!(await this.dataSource.query(
      `
        UPDATE "Sessions"
        SET "lastActiveDate"=$2, "expDate"=$3
        WHERE id=$1`,
      [session[0].id, newSession.lastActiveDate, newSession.expDate],
    ));
  }

  async checkPresenceInTheList(
    userId: string,
    deviceId: string,
    issuedAt: Date,
  ): Promise<boolean> {
    return !!(
      await this.dataSource.query<SessionDocument[]>(
        `
        SELECT * FROM "Sessions"
        WHERE "userId" = $1
        AND "deviceId" = $2
        AND "lastActiveDate" = $3`,
        [userId, deviceId, issuedAt],
      )
    ).length;
  }

  async terminateAllButOne(userId: string, deviceId: string): Promise<boolean> {
    return !!(await this.dataSource.query(
      `
        DELETE FROM "Sessions"
        WHERE "userId" = $1
        AND NOT "deviceId" = $2`,
      [userId, deviceId],
    ));
  }

  async terminateSession(deviceId: string): Promise<boolean> {
    return !!(await this.dataSource.query(
      `
        DELETE FROM "Sessions"
        WHERE "deviceId" = $1`,
      [deviceId],
    ));
  }

  async deleteAll(): Promise<void> {
    await this.dataSource.query(`DELETE FROM "Sessions"`);
  }
}
