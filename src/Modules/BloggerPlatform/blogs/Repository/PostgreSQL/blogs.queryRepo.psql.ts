import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogViewModel } from '../../blogs.models';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IBlogsQueryRepo } from '../../Service/blogs.service';

@Injectable()
export class BlogsQueryRepoPSQL implements IBlogsQueryRepo {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findWithSearchAndPagination(
    paginationSettings: Paginator,
  ): Promise<Paginated<BlogViewModel>> {
    const { searchNameTerm, pageSize, pageNumber, sortBy, sortDirection } =
      paginationSettings;

    const blogs = await this.dataSource.query<BlogDocument[]>(
      `
    SELECT * FROM "Blogs"
        WHERE name ILIKE $1
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $2
        OFFSET $3
    `,
      [`%${searchNameTerm}%`, pageSize, (pageNumber - 1) * pageSize],
    );
    const totalCount = (
      await this.dataSource.query<{ count: string }[]>(
        `
        SELECT COUNT(*) FROM "Blogs"
        WHERE name ILIKE $1`,
        [`%${searchNameTerm}%`],
      )
    )[0].count;
    return paginationSettings.Paginate<BlogViewModel>(
      +totalCount,
      blogs.map((blog: any): BlogViewModel => Blog.mapSQLToViewModel(blog)),
    );
  }

  async findById(id: string): Promise<BlogViewModel | null> {
    const result: BlogDocument[] = await this.dataSource.query(
      `SELECT * FROM "Blogs" WHERE id=$1`,
      [id],
    );
    if (result.length !== 1) {
      return null;
    }
    return Blog.mapSQLToViewModel(result[0]);
  }
}
