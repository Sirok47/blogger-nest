import {
  Blog,
  BlogDocument,
  type BlogModelType,
  BlogViewModel,
} from './blogs.models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Paginated, Paginator } from '../../../Models/paginator.models';

@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}
  async findWithSearchAndPagination(
    paginationSettings: Paginator,
  ): Promise<Paginated<BlogViewModel>> {
    const filter = paginationSettings.searchNameTerm
      ? { name: { $regex: paginationSettings.searchNameTerm, $options: 'i' } }
      : {};
    const query = this.BlogModel.find(filter);
    const totalCount: number =
      await this.BlogModel.countDocuments(filter).exec();

    let blogs: BlogDocument[];
    if (!paginationSettings) {
      blogs = await query.exec();
    } else {
      blogs = await paginationSettings.QueryForPage<BlogDocument>(query).exec();
    }

    return paginationSettings.Paginate<BlogViewModel>(
      totalCount,
      blogs.map((blog: BlogDocument): BlogViewModel => blog.mapToViewModel()),
    );
  }

  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findById(id).exec();
  }
}
