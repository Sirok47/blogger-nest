import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizGameStatsPSQL } from '../entities/quiz-game-stats.entity';
import { Repository } from 'typeorm';
import {
  Paginated,
  Paginator,
  SortDirections,
  SortingInstruction,
} from '../../../Models/paginator.models';
import { QuizGameStatsWithUserViewModel } from '../DTOs/stats.dto';

const SORTABLE_FIELDS: Record<string, string> = {
  sumScore: 's.sumScore',
  avgScores: 's.avgScores',
  gamesCount: 's.gamesCount',
  winsCount: 's.winsCount',
  lossesCount: 's.lossesCount',
  drawsCount: 's.drawsCount',
};

@Injectable()
export class QuizGameStatsQueryRepo {
  constructor(
    @InjectRepository(QuizGameStatsPSQL)
    private readonly repo: Repository<QuizGameStatsPSQL>,
  ) {}

  async getStatsOfUser(userId: string): Promise<QuizGameStatsPSQL | null> {
    return this.repo.findOne({
      relations: ['user'],
      where: {
        userId: userId,
      },
    });
  }

  async getLeaderboard(
    paginationSettings: Paginator,
  ): Promise<Paginated<QuizGameStatsWithUserViewModel>> {
    const { sort, pageSize, pageNumber } = paginationSettings;

    const baseQuery = this.repo
      .createQueryBuilder('s')
      .innerJoin('s.user', 'u');

    const totalCount = await baseQuery
      .clone()
      .select('COUNT(*)', 'cnt')
      .getRawOne()
      .then((r) => Number(r.cnt));

    const sorting: SortingInstruction[] = [];
    for (const instruction of sort) {
      const [field, dir] = instruction.split(' ');
      sorting.push({
        field: field,
        direction: SortDirections[dir.toLowerCase()],
      });
    }

    const statIdsQuery = baseQuery.clone().select('s.id', 'id').distinct(true);

    sorting.forEach((instruction, index) => {
      const column = SORTABLE_FIELDS[instruction.field];
      if (!column) throw new BadRequestException();

      const direction = instruction.direction.toUpperCase() as 'ASC' | 'DESC';

      statIdsQuery.addSelect(column, `sort_${index}`);

      if (index === 0) {
        statIdsQuery.orderBy(column, direction);
      } else {
        statIdsQuery.addOrderBy(column, direction);
      }
    });

    statIdsQuery.addOrderBy('s.id', 'ASC');

    const statIdsRaw = await statIdsQuery
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getRawMany();

    const statIds = statIdsRaw.map((s) => s.id);

    if (!statIds.length) {
      return paginationSettings.Paginate<QuizGameStatsWithUserViewModel>(0, []);
    }

    const stats = await this.repo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .whereInIds(statIds)
      .orderBy('array_position(:ids, s.id)')
      .setParameter('ids', statIds)
      .getMany();

    return paginationSettings.Paginate<QuizGameStatsWithUserViewModel>(
      totalCount,
      stats.map((s) => s.mapToViewModelWithUser()),
    );
  }
}
