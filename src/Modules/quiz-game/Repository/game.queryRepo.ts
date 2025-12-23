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
      .leftJoinAndSelect('g.players', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('g.questions', 'gq')
      .leftJoinAndSelect('gq.question', 'q')
      .where('g.id = :id', { id: gameId })
      .andWhere('g.status = :pending OR g.status = :active', {
        pending: GameStatus.pending,
        active: GameStatus.active,
      })
      .addOrderBy('p."createdAt"', 'ASC')
      .addOrderBy('gq.id', 'ASC')
      .getOne();
    if (!game) {
      return null;
    }
    return game;
  }
}
