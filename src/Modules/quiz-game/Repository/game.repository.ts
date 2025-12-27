import { Injectable } from '@nestjs/common';
import { GamePSQL, GameStatus } from '../entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(GamePSQL) private readonly repo: Repository<GamePSQL>,
  ) {}

  save(game: GamePSQL): Promise<GamePSQL> {
    return this.repo.save(game);
  }

  async findById(id: string): Promise<GamePSQL | null> {
    return this.repo.findOne({
      where: { id: id },
      relations: {
        players: { answers: { question: true } },
        questions: true,
      },
    });
  }

  searchForOpenGame(): Promise<GamePSQL | null> {
    return this.repo.findOne({
      where: { status: GameStatus.pending },
      relations: ['players', 'questions'],
    });
  }

  async hasActiveGame(userId: string): Promise<boolean> {
    return this.repo.existsBy({
      status: Not(GameStatus.finished),
      players: {
        userId: userId,
      },
    });
  }

  async deleteAll(): Promise<void> {
    await this.repo.deleteAll();
  }
}
