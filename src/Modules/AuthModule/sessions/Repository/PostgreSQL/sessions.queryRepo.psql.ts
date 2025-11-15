import { Injectable } from '@nestjs/common';
import { SessionPSQL, SessionViewModel } from '../../sessions.models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISessionsQueryRepo } from '../../../auth/Service/auth.service';

@Injectable()
export class SessionsQueryRepoPSQL implements ISessionsQueryRepo {
  constructor(
    @InjectRepository(SessionPSQL)
    private readonly repo: Repository<SessionPSQL>,
  ) {}

  async getSessions(userId: string): Promise<SessionViewModel[]> {
    const sessions: SessionPSQL[] = await this.repo
      .createQueryBuilder('s')
      .select([
        's.id',
        's.title',
        's.lastActiveDate',
        's.expDate',
        's.deviceId',
        's.userId',
      ])
      .addSelect('s.IP', 'ip')
      .where('s.userId = :id', { id: userId })
      .andWhere('s.expDate = :date', { date: new Date() })
      .getMany();

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
