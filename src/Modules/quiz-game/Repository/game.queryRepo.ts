import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { GamePSQL } from '../entities/game.entity';
import {
  GameProgressViewModel,
  GameStatus,
  GameViewModelNaming,
} from '../DTOs/game.dto';
import {
  Paginated,
  Paginator,
  SortDirections,
} from '../../../Models/paginator.models';

@Injectable()
export class GameQueryRepo {
  constructor(
    @InjectRepository(GamePSQL)
    private readonly repo: Repository<GamePSQL>,
  ) {}

  async getGameProgressById(
    gameId: string,
    showFinished: boolean = false,
  ): Promise<GamePSQL | null> {
    let query = this.repo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.players', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('g.questions', 'gq')
      .leftJoinAndSelect('gq.question', 'q')
      .where('g.id = :id', { id: gameId });

    if (!showFinished) {
      query = query.andWhere(
        new Brackets((qb) => {
          qb.where('g.status = :pending', {
            pending: GameStatus.pending,
          }).orWhere('g.status = :active', {
            active: GameStatus.active,
          });
        }),
      );
    }

    return query
      .addOrderBy('p."createdAt"', 'ASC')
      .addOrderBy('a."createdAt"', 'ASC')
      .addOrderBy('gq.id', 'ASC')
      .getOne();
  }

  async getGameHistoryOfUser(
    userId: string,
    paginationSettings: Paginator,
  ): Promise<Paginated<GameProgressViewModel>> {
    const { sortBy, pageSize, pageNumber, sortDirection } = paginationSettings;

    const query = this.repo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.players', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('g.questions', 'gq')
      .leftJoinAndSelect('gq.question', 'q')
      .where('p."userId" = :id', { id: userId })
      .addOrderBy('p."createdAt"', 'ASC')
      .addOrderBy('a."createdAt"', 'ASC')
      .addOrderBy('gq.id', 'ASC');

    const games: GamePSQL[] = await query
      .addOrderBy(
        `g.${GameViewModelNaming[sortBy]}`,
        sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .addOrderBy(
        'g."createdAt"',
        SortDirections.desc.toUpperCase() as 'ASC' | 'DESC',
      )
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getMany();

    const totalCount: number = await query.getCount();

    return paginationSettings.Paginate<GameProgressViewModel>(
      +totalCount,
      games.map(
        (game: GamePSQL): GameProgressViewModel => game.mapToViewModel(),
      ),
    );
  }
}
