import { Inject, Injectable } from '@nestjs/common';
import {
  Comment,
  CommentDocument,
  CommentPSQL,
  CommentViewModel,
  LikesInfo,
} from '../../comments.entity';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import {
  type ILikesRepository,
  LIKES_REPOSITORY,
} from '../../../likes/likes.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SELECT_JSON_SERIALIZE_COMMENT } from './comments.repository.rawpsql';
import { ICommentsQueryRepo } from '../../Service/comments.service';
import { User } from '../../../../AuthModule/users/users.entity';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../../AuthModule/users/Service/users.service';

@Injectable()
export class CommentsQueryRepoRawPSQL implements ICommentsQueryRepo {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(LIKES_REPOSITORY)
    private readonly likesRepo: ILikesRepository,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepo: IUsersRepository,
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
      const userInfo: User | null = await this.usersRepo.findById(userId);
      commentsVM.push(
        CommentPSQL.mapSQLToViewModel(comment, likeInfo, userInfo!),
      );
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
    const userInfo: User | null = await this.usersRepo.findById(userId);
    return CommentPSQL.mapSQLToViewModel(comment, likesInfo, userInfo!);
  }
}
