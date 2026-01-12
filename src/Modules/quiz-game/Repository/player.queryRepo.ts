import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { PlayerPSQL } from '../entities/player.entity';
import { PlayerStats } from '../DTOs/player.dto';

@Injectable()
export class PlayerQueryRepo {
  constructor(
    @InjectRepository(PlayerPSQL)
    private readonly repo: Repository<PlayerPSQL>,
  ) {}

  async getStatsOfUser(userId: string): Promise<PlayerStats> {
    const players = await this.repo.findBy({
      id: userId,
      result: Not(IsNull()),
    });

    const stats = new PlayerStats();
    stats.calculateStats(players);

    return stats;
  }
}
