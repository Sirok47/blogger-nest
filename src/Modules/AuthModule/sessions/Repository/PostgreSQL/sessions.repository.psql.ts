import { Injectable } from '@nestjs/common';
import { Session, SessionPSQL } from '../../sessions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ISessionsRepository } from '../../../auth/Service/auth.service';

@Injectable()
export class SessionsRepositoryPSQL implements ISessionsRepository {
  constructor(
    @InjectRepository(SessionPSQL)
    private readonly repo: Repository<SessionPSQL>,
  ) {}

  create(session: Session): SessionPSQL {
    return SessionPSQL.CreateDocument(session);
  }

  async getSessionByDeviceId(deviceId: string): Promise<SessionPSQL | null> {
    return this.repo.findOneBy({ deviceId });
  }

  async save(session: Session): Promise<SessionPSQL> {
    return this.repo.save(session);
  }

  async refreshSession(newSession: SessionPSQL): Promise<boolean> {
    const result = await this.repo.update(
      {
        deviceId: newSession.deviceId,
        user: { id: newSession.userId },
      },
      newSession,
    );
    return !!result.affected;
  }

  async checkPresenceInTheList(
    userId: string,
    deviceId: string,
    issuedAt: Date,
  ): Promise<boolean> {
    return this.repo.existsBy({
      user: { id: userId },
      deviceId: deviceId,
      lastActiveDate: issuedAt,
    });
  }

  async terminateAllButOne(userId: string, deviceId: string): Promise<boolean> {
    return !!(await this.repo.delete({
      deviceId: Not(deviceId),
      userId: userId,
    }));
  }

  async terminateSession(deviceId: string): Promise<boolean> {
    return !!(await this.repo.delete(deviceId));
  }

  async deleteAll(): Promise<void> {
    await this.repo.deleteAll();
  }
}
