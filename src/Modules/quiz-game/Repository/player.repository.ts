import { Injectable } from '@nestjs/common';
import { PlayerPSQL } from '../entities/player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { GameStatus } from '../DTOs/game.dto';

@Injectable()
export class PlayerRepository {
  constructor(
    @InjectRepository(PlayerPSQL) private readonly repo: Repository<PlayerPSQL>,
  ) {}

  async save(player: PlayerPSQL): Promise<PlayerPSQL> {
    return this.repo.save(player);
  }

  async getActiveOfUser(userId: string): Promise<PlayerPSQL | null> {
    return this.repo.findOneBy({
      userId: userId,
      game: { status: Not(GameStatus.finished) },
    });
  }
  async getActiveOfUserWithRelations(
    userId: string,
  ): Promise<PlayerPSQL | null> {
    return this.repo.findOne({
      relations: {
        game: { questions: { question: true } },
        user: true,
        answers: true,
      },
      where: { userId: userId, game: { status: Not(GameStatus.finished) } },
    });
  }

  async deleteAll(): Promise<void> {
    await this.repo.deleteAll();
  }
}
