import { Injectable } from '@nestjs/common';
import { IPostsRepository } from '../../Service/posts.service';
import { PostDocument } from '../../posts.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepositoryPSQL implements IPostsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async save(post: PostDocument): Promise<PostDocument> {
    if (!post.createdAt) {
      return (
        await this.dataSource.query<PostDocument[]>(
          `
          INSERT INTO "Posts"(id, title, "shortDescription", content, "blogId","blogName", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            post.id,
            post.title,
            post.shortDescription,
            post.content,
            post.blogId,
            post.blogName,
            new Date(),
          ],
        )
      )[0];
    } else {
      return (
        await this.dataSource.query<PostDocument[]>(
          `
          UPDATE "Posts"
          SET title=$2, "shortDescription"=$3, content=$4, "blogId"=$5, "blogName"=$6
          WHERE id=$1
          RETURNING *`,
          [
            post.id,
            post.title,
            post.shortDescription,
            post.content,
            post.blogId,
            post.blogName,
          ],
        )
      )[0];
    }
  }

  async findById(id: string): Promise<PostDocument | null> {
    const result = await this.dataSource.query<PostDocument[]>(
      `SELECT * FROM "Posts"
          WHERE "id" = $1`,
      [id],
    );
    if (result.length < 1) {
      return null;
    }
    return result[0];
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dataSource.query<unknown[]>(
      `DELETE FROM "Posts" WHERE id=$1`,
      [id],
    );
    return !!result[1];
  }

  async deleteAll(): Promise<void> {
    await this.dataSource.query(`DELETE FROM "Posts"`);
  }
}
