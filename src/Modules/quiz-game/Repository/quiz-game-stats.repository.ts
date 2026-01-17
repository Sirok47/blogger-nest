import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizGameStatsPSQL } from '../entities/quiz-game-stats.entity';
import { PlayerPSQL } from '../entities/player.entity';
import { PlayerRepository } from './player.repository';

@Injectable()
export class QuizGameStatsRepository {
  constructor(
    private readonly playerRepo: PlayerRepository,
    @InjectRepository(QuizGameStatsPSQL)
    private readonly repo: Repository<QuizGameStatsPSQL>,
  ) {}

  async save(stat: QuizGameStatsPSQL) {
    return this.repo.save(stat);
  }

  async createStatsForUser(userId: string): Promise<QuizGameStatsPSQL> {
    const players = await this.playerRepo.getAllFinishedOfUser(userId);
    const stats = new QuizGameStatsPSQL(userId, players);
    return this.repo.save(stats);
  }

  async updateStatsOfUser(player: PlayerPSQL): Promise<void> {
    let stats = await this.repo.findOneBy({
      userId: player.userId,
    });
    if (!stats) {
      stats = await this.createStatsForUser(player.userId);
    }
    stats.updateStats(player);

    await this.repo.save(stats);
    return;
  }
}
