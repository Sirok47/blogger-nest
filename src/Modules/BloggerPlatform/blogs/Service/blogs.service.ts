import {
  Blog,
  BlogDocument,
  type BlogModelType,
  BlogViewModel,
} from '../blogs.models';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Paginated, Paginator } from '../../../../Models/paginator.models';

export interface IBlogsQueryRepo {
  findWithSearchAndPagination(
    paginationSettings: Paginator,
  ): Promise<Paginated<BlogViewModel>>;

  findById(id: string): Promise<BlogViewModel | null>;
}

export const BLOGS_QUERY_REPO = Symbol('IBlogsQueryRepo');

export interface IBlogsRepository {
  save(blog: BlogDocument): Promise<BlogDocument>;

  findById(id: string): Promise<BlogDocument | null>;

  delete(id: string): Promise<boolean>;

  deleteAll(): Promise<void>;
}

export const BLOGS_REPOSITORY = Symbol('IBlogsRepository');

@Injectable()
export class BlogsService {
  constructor(
    @Inject(BLOGS_REPOSITORY)
    protected repository: IBlogsRepository,
    @InjectModel(Blog.name) protected BlogModel: BlogModelType,
  ) {}
}
