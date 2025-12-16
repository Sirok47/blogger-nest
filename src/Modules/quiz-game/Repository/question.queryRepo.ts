import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  Paginated,
  Paginator,
  StatusSearchTerms,
} from '../../../Models/paginator.models';
import { QuestionPSQL } from '../entities/question.entity';
import { QuestionViewModel } from '../DTOs/question.dto';

@Injectable()
export class QuestionQueryRepo {
  constructor(
    @InjectRepository(QuestionPSQL)
    private readonly repo: Repository<QuestionPSQL>,
  ) {}

  async findWithSearchAndPagination(
    paginationSettings: Paginator,
  ): Promise<Paginated<QuestionViewModel>> {
    const {
      bodySearchTerm,
      publishedStatus,
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
    } = paginationSettings;

    let baseQuery: SelectQueryBuilder<QuestionPSQL> = this.repo
      .createQueryBuilder('q')
      .where('q.body ILIKE :body', { body: `%${bodySearchTerm}%` });

    switch (publishedStatus) {
      case StatusSearchTerms.published:
        baseQuery = baseQuery.andWhere('q."isPublished" = true');
        break;
      case StatusSearchTerms.notPublished:
        baseQuery = baseQuery.andWhere('q."isPublished" = false');
        break;
      case StatusSearchTerms.all:
      default:
    }

    const questions: QuestionPSQL[] = await baseQuery
      .orderBy(`q.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getMany();

    const totalCount: number = await baseQuery.getCount();

    return paginationSettings.Paginate<QuestionViewModel>(
      +totalCount,
      questions.map(
        (question: QuestionPSQL): QuestionViewModel =>
          question.mapToViewModel(),
      ),
    );
  }

  async findById(id: string): Promise<QuestionViewModel | null> {
    const question: QuestionPSQL | null = await this.repo
      .createQueryBuilder('q')
      .where('q.id = :id', { id: id })
      .getOne();

    return question ? question.mapToViewModel() : null;
  }
}
