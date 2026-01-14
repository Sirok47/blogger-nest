import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { GamePSQL } from '../entities/game.entity';
import {
  GameProgressViewModel,
  GameStatus,
  GameViewModelNaming,
} from '../DTOs/game.dto';
import { Paginated, Paginator } from '../../../Models/paginator.models';

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

    const baseQuery = this.repo
      .createQueryBuilder('g')
      .innerJoin('g.players', 'p')
      .where('p."userId" = :userId', { userId });

    const totalCount = await baseQuery
      .clone()
      .select('COUNT(DISTINCT g.id)', 'cnt')
      .getRawOne()
      .then((r) => Number(r.cnt));

    const sortColumn = `g.${GameViewModelNaming[sortBy]}`;

    const gameIdsRaw = await baseQuery
      .clone()
      .select('g.id', 'id')
      .addSelect(sortColumn, 'sortValue')
      .distinct(true)
      .orderBy(
        `g.${GameViewModelNaming[sortBy]}`,
        sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .addOrderBy('g."createdAt"', 'DESC')
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getRawMany();

    const gameIds = gameIdsRaw.map((g) => g.id);

    if (!gameIds.length) {
      return paginationSettings.Paginate<GameProgressViewModel>(0, []);
    }

    const games = await this.repo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.players', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('g.questions', 'gq')
      .leftJoinAndSelect('gq.question', 'q')
      .where('g.id IN (:...ids)', { ids: gameIds })
      .orderBy('array_position(:ids, g.id)')
      .setParameter('ids', gameIds)
      .addOrderBy('p."createdAt"', 'ASC')
      .addOrderBy('a."createdAt"', 'ASC')
      .addOrderBy('gq.id', 'ASC')
      .getMany();

    return paginationSettings.Paginate<GameProgressViewModel>(
      totalCount,
      games.map((g) => g.mapToViewModel()),
    );
  }
}
