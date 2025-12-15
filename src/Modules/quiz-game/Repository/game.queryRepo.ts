import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePSQL, GameStatus } from '../entities/game.entity';

@Injectable()
export class GameQueryRepo {
  constructor(
    @InjectRepository(GamePSQL)
    private readonly repo: Repository<GamePSQL>,
  ) {}

  async getGameProgressById(gameId: string): Promise<GamePSQL | null> {
    const game: GamePSQL | null = await this.repo
      .createQueryBuilder('g')
      .leftJoinAndSelect('players', 'p')
      .leftJoinAndSelect('questions', 'q')
      .leftJoinAndSelect('p.user', 'u')
      .where('gameId = $1', [gameId])
      .andWhere('status = $1 OR status = $2', [
        GameStatus.pending,
        GameStatus.active,
      ])
      .getOne();
    if (!game) {
      return null;
    }
    return game;
  }
}
