import {
  BlogDocument,
  type BlogModelType,
  BlogMongo,
  BlogViewModel,
} from '../../blogs.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import { IBlogsQueryRepo } from '../../Service/blogs.service';

@Injectable()
export class BlogsQueryRepo implements IBlogsQueryRepo {
  constructor(@InjectModel('Blog') private BlogModel: BlogModelType) {}
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

  async findById(id: string): Promise<BlogViewModel | null> {
    const blog: BlogDocument | null = await this.BlogModel.findById(id).exec();

    return blog ? blog.mapToViewModel() : null;
  }
}
