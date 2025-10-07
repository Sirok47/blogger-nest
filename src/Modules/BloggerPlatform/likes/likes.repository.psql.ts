import { Injectable } from '@nestjs/common';
import { ILikesRepository, LikeDocument, LikeStatus } from './likes.models';
import { LikesInfo } from '../comments/comments.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesRepositoryPSQL implements ILikesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async save(like: LikeDocument) {
    if (!like.createdAt) {
      return (
        await this.dataSource.query<LikeDocument[]>(
          `
          INSERT INTO "Likes"(id, "userId", login, "targetId", status, "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *`,
          [
            like.id,
            like.userId,
            like.login,
            like.targetId,
            like.status,
            new Date(),
          ],
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

  async getLatestLikes(postId: string): Promise<LikeDocument[]> {
    return this.dataSource.query<LikeDocument[]>(
      `
    SELECT * FROM "Likes"
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
