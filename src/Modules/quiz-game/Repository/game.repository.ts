import { Injectable } from '@nestjs/common';
import { GamePSQL } from '../entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { GameStatus } from '../DTOs/game.dto';

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
    console.log(
      await this.repo.findOne({
        relations: ['players'],
        where: {
          status: Not(GameStatus.finished),
          players: {
            userId: userId,
          },
        },
      }),
    );
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
