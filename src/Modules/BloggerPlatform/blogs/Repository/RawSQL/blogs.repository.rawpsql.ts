import { Injectable } from '@nestjs/common';
import { Blog, BlogInputModel, BlogPSQL } from '../../blogs.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IBlogsRepository } from '../../Service/blogs.service';

@Injectable()
export class BlogsRepositoryRawPSQL implements IBlogsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  create(inputBlog: BlogInputModel): Blog {
    return BlogPSQL.CreateDocument(inputBlog);
  }

  async save(blog: Blog): Promise<Blog> {
    if (!blog.createdAt) {
      return (
        await this.dataSource.query(
          `
          INSERT INTO "Blogs"(id, name, description, "websiteUrl", "isMembership", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *`,
          [
            blog.id,
            blog.name,
            blog.description,
            blog.websiteUrl,
            blog.isMembership,
            new Date(),
          ],
        )
      )[0];
    } else {
      return (
        await this.dataSource.query(
          `
          UPDATE "Blogs"
            SET name=$2, description=$3, "websiteUrl"=$4
            WHERE id=$1
            RETURNING *`,
          [blog.id, blog.name, blog.description, blog.websiteUrl],
        )
      )[0];
    }
  }

  async findById(id: string): Promise<BlogPSQL | null> {
    const result = await this.dataSource.query<BlogPSQL[]>(
      `SELECT * FROM "Blogs"
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
      `DELETE FROM "Blogs" WHERE id=$1`,
      [id],
    );
    return !!result[1];
  }

  async deleteAll(): Promise<void> {
    await this.dataSource.query(`DELETE FROM "Blogs"`);
  }
}
