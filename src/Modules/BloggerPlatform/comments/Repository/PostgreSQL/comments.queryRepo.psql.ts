import { Inject, Injectable } from '@nestjs/common';
import {
  Comment,
  CommentDocument,
  CommentViewModel,
  LikesInfo,
} from '../../comments.models';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import {
  type ILikesRepository,
  LIKES_REPOSITORY,
} from '../../../likes/likes.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SELECT_JSON_SERIALIZE_COMMENT } from './comments.repository.psql';
import { ICommentsQueryRepo } from '../../Service/comments.service';

@Injectable()
export class CommentsQueryRepoPSQL implements ICommentsQueryRepo {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(LIKES_REPOSITORY)
    private readonly likesRepo: ILikesRepository,
  ) {}

  async findWithSearchAndPagination(
    postId: string,
    paginationSettings: Paginator,
    userId: string,
  ): Promise<Paginated<CommentViewModel>> {
    const { pageSize, pageNumber, sortBy, sortDirection } = paginationSettings;

    const comments = await this.dataSource.query<CommentDocument[]>(
      `
    SELECT ${SELECT_JSON_SERIALIZE_COMMENT} FROM "Comments"
        WHERE "postId"=$1
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $2
        OFFSET $3
    `,
      [postId, pageSize, (pageNumber - 1) * pageSize],
    );
    const totalCount = (
      await this.dataSource.query<{ count: string }[]>(
        `
        SELECT COUNT(*) FROM "Comments"
        WHERE "postId"=$1`,
        [postId],
      )
    )[0].count;

    const commentsVM: CommentViewModel[] = [];
    for (const comment of comments) {
      const likeInfo: LikesInfo = await this.likesRepo.gatherLikesInfoOf(
        comment.id,
        userId,
      );
      commentsVM.push(Comment.mapSQLToViewModel(comment, likeInfo));
    }

    return paginationSettings.Paginate<CommentViewModel>(
      +totalCount,
      commentsVM,
    );
  }

  async findById(id: string, userId: string): Promise<CommentViewModel | null> {
    const result: CommentDocument[] = await this.dataSource.query<
      CommentDocument[]
    >(`SELECT ${SELECT_JSON_SERIALIZE_COMMENT} FROM "Comments" WHERE id=$1`, [
      id,
    ]);
    if (result.length !== 1) {
      return null;
    }
    const comment = result[0];
    const likesInfo: LikesInfo = await this.likesRepo.gatherLikesInfoOf(
      comment.id,
      userId,
    );
    return Comment.mapSQLToViewModel(comment, likesInfo);
  }
}
