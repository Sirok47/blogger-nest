import { Injectable } from '@nestjs/common';
import { BlogPSQL, BlogViewModel } from '../../blogs.entity';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { IBlogsQueryRepo } from '../../Service/blogs.service';

@Injectable()
export class BlogsQueryRepoPSQL implements IBlogsQueryRepo {
  constructor(
    @InjectRepository(BlogPSQL) private readonly repo: Repository<BlogPSQL>,
  ) {}

  async findWithSearchAndPagination(
    paginationSettings: Paginator,
  ): Promise<Paginated<BlogViewModel>> {
    const { searchNameTerm, pageSize, pageNumber, sortBy, sortDirection } =
      paginationSettings;

    const baseQuery: SelectQueryBuilder<BlogPSQL> = this.repo
      .createQueryBuilder('b')
      .where('b.name ILIKE :name', { name: `%${searchNameTerm}%` });

    const blogs: BlogPSQL[] = await baseQuery
      .orderBy(`b.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getMany();

    const totalCount: number = await baseQuery.getCount();

    return paginationSettings.Paginate<BlogViewModel>(
      +totalCount,
      blogs.map((blog: BlogPSQL): BlogViewModel => blog.mapToViewModel()),
    );
  }

  async findById(id: string): Promise<BlogViewModel | null> {
    const blog: BlogPSQL | null = await this.repo
      .createQueryBuilder('b')
      .where('b.id = :id', { id: id })
      .getOne();

    return blog ? blog.mapToViewModel() : null;
  }
}
