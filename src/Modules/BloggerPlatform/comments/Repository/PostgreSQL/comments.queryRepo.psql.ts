import { Inject, Injectable } from '@nestjs/common';
import {
  CommentPSQL,
  CommentViewModel,
  LikesInfo,
} from '../../comments.entity';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import {
  type ILikesRepository,
  LIKES_REPOSITORY,
} from '../../../likes/likes.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ICommentsQueryRepo } from '../../Service/comments.service';

@Injectable()
export class CommentsQueryRepoPSQL implements ICommentsQueryRepo {
  constructor(
    @InjectRepository(CommentPSQL)
    private readonly repo: Repository<CommentPSQL>,
    @Inject(LIKES_REPOSITORY)
    private readonly likesRepo: ILikesRepository,
  ) {}

  async findWithSearchAndPagination(
    postId: string,
    paginationSettings: Paginator,
    userId: string,
  ): Promise<Paginated<CommentViewModel>> {
    const { pageSize, pageNumber, sortBy, sortDirection } = paginationSettings;

    const baseQuery: SelectQueryBuilder<CommentPSQL> = this.repo
      .createQueryBuilder('c')
      .where('c.postId = :id', { id: postId });

    const comments: CommentPSQL[] = await baseQuery
      .leftJoinAndSelect('c.commentator', 'u')
      .orderBy(`c.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getMany();

    const totalCount: number = await baseQuery.getCount();

    const commentsVM: CommentViewModel[] = [];
    for (const comment of comments) {
      const likeInfo: LikesInfo = await this.likesRepo.gatherLikesInfoOf(
        comment.id,
        userId,
      );
      commentsVM.push(comment.mapToViewModel(likeInfo, comment.commentator));
    }

    return paginationSettings.Paginate<CommentViewModel>(
      +totalCount,
      commentsVM,
    );
  }

  async findById(id: string, userId: string): Promise<CommentViewModel | null> {
    const comment: CommentPSQL | null = await this.repo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.commentator', 'u')
      .where('c.id = :id', { id: id })
      .getOne();
    if (!comment) {
      return null;
    }
    const likesInfo: LikesInfo = await this.likesRepo.gatherLikesInfoOf(
      comment.id,
      userId,
    );
    return comment.mapToViewModel(likesInfo, comment.commentator);
  }
}
