import { Injectable } from '@nestjs/common';
import {
  Comment,
  CommentatorInfo,
  CommentDocument,
  CommentInputModel,
  CommentPSQL,
} from '../../comments.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ICommentsRepository } from '../../Service/comments.service';

export const SELECT_JSON_SERIALIZE_COMMENT = `
id,
content,
"postId",
"createdAt",
JSON_OBJECT('userId': "userId", 'userLogin': "userLogin") as "commentatorInfo"
`;

@Injectable()
export class CommentsRepositoryRawPSQL implements ICommentsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  create(
    postId: string,
    input: CommentInputModel,
    commentatorInfo: CommentatorInfo,
  ): Comment {
    return CommentPSQL.CreateDocument(postId, input, commentatorInfo);
  }

  async save(comment: CommentPSQL): Promise<CommentPSQL> {
    if (!comment.createdAt) {
      return (
        await this.dataSource.query(
          `
          INSERT INTO "Comments"(id, content, "postId", "userId", "userLogin", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING ${SELECT_JSON_SERIALIZE_COMMENT}`,
          [
            comment.id,
            comment.content,
            comment.postId,
            comment.commentator.id,
            comment.commentator.login,
            new Date(),
          ],
        )
      )[0];
    } else {
      return (
        await this.dataSource.query(
          `
          UPDATE "Comments"
            SET content=$2
            WHERE id=$1
            RETURNING ${SELECT_JSON_SERIALIZE_COMMENT}`,
          [comment.id, comment.content],
        )
      )[0];
    }
  }

  async findById(id: string): Promise<CommentDocument | null> {
    const result = await this.dataSource.query<CommentDocument[]>(
      `SELECT ${SELECT_JSON_SERIALIZE_COMMENT} FROM "Comments"
          WHERE "id" = $1`,
      [id],
    );
    if (result.length !== 1) {
      return null;
    }
    return result[0];
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dataSource.query<unknown[]>(
      `DELETE FROM "Comments" WHERE id=$1`,
      [id],
    );
    return !!result[1];
  }

  async deleteAll(): Promise<void> {
    await this.dataSource.query(`DELETE FROM "Comments"`);
  }
}
