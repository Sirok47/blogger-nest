import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { GamePSQL } from '../entities/game.entity';
import { GameStatus } from '../DTOs/game.dto';

@Injectable()
export class GameQueryRepo {
  constructor(
    @InjectRepository(GamePSQL)
    private readonly repo: Repository<GamePSQL>,
  ) {}

  async getGameProgressById(gameId: string): Promise<GamePSQL | null> {
    return await this.repo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.players', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('g.questions', 'gq')
      .leftJoinAndSelect('gq.question', 'q')
      .where('g.id = :id', { id: gameId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('g.status = :pending', {
            pending: GameStatus.pending,
          }).orWhere('g.status = :active', {
            active: GameStatus.active,
          });
        }),
      )
      .addOrderBy('p."createdAt"', 'ASC')
      .addOrderBy('a."createdAt"', 'ASC')
      .addOrderBy('gq.id', 'ASC')
      .getOne();
  }
}
