import { Injectable } from '@nestjs/common';
import {
  ILikesRepository,
  Like,
  LikeDocument,
  LikePSQL,
  LikeStatus,
} from '../likes.models';
import { LikesInfo } from '../../comments/comments.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../../AuthModule/users/users.models';

@Injectable()
export class LikesRepositoryRawPSQL implements ILikesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  create(user: User, targetId: string, status: LikeStatus): Like {
    return LikePSQL.CreateDoc(user, targetId, status);
  }

  async save(like: Like): Promise<Like> {
    if (!like.createdAt) {
      return (
        await this.dataSource.query<LikeDocument[]>(
          `
          INSERT INTO "Likes"(id, "userId", "targetId", status, "createdAt")
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *`,
          [like.id, like.userId, like.targetId, like.status, new Date()],
        )
      )[0];
    } else {
      return (
        await this.dataSource.query<LikeDocument[]>(
          `
          UPDATE "Likes"
            SET status=$2
            WHERE id=$1
            RETURNING *`,
          [like.id, like.status],
        )
      )[0];
    }
  }

  async getLike(
    commentId: string,
    userId: string,
  ): Promise<LikeDocument | null> {
    return (
      await this.dataSource.query<LikeDocument[]>(
        `
    SELECT * FROM "Likes"
    WHERE "targetId" = $1
    AND "userId" = $2
    `,
        [commentId, userId],
      )
    )[0];
  }

  async countLikesOf(targetId: string): Promise<number> {
    return +(
      await this.dataSource.query<{ count: string }[]>(
        `
    SELECT COUNT(*) FROM "Likes"
    WHERE "targetId" = $1
    AND status = '${LikeStatus.Like}'
    `,
        [targetId],
      )
    )[0].count;
  }

  async countDislikesOf(targetId: string): Promise<number> {
    return +(
      await this.dataSource.query<{ count: string }[]>(
        `
    SELECT COUNT(*) FROM "Likes"
    WHERE "targetId" = $1
    AND status = '${LikeStatus.Dislike}'
    `,
        [targetId],
      )
    )[0].count;
  }

  async gatherLikesInfoOf(
    targetId: string,
    userId: string,
  ): Promise<LikesInfo> {
    return {
      likesCount: await this.countLikesOf(targetId),
      dislikesCount: await this.countDislikesOf(targetId),
      myStatus: userId
        ? ((await this.getLike(targetId, userId))?.status ?? LikeStatus.None)
        : LikeStatus.None,
    };
  }

  async getLatestLikes(postId: string): Promise<(Like & { login: string })[]> {
    return this.dataSource.query<(Like & { login: string })[]>(
      `
    SELECT *, u.login as "login" FROM "Likes" l
    LEFT JOIN "Users" u ON "l.userId" = u.id
    WHERE "targetId" = $1
    AND status = 'Like'
    ORDER BY "createdAt" DESC
    LIMIT 3
    `,
      [postId],
    );
  }

  async deleteAll() {
    await this.dataSource.query(`DELETE FROM "Likes"`);
  }
}
