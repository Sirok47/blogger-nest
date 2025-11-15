import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  BlogInputModel,
  type BlogModelType,
  BlogMongo,
} from '../../blogs.models';
import { IBlogsRepository } from '../../Service/blogs.service';

@Injectable()
export class BlogsRepository implements IBlogsRepository {
  constructor(
    @InjectModel(BlogMongo.name)
    private BlogModel: BlogModelType,
  ) {}

  create(inputBlog: BlogInputModel): Blog {
    return this.BlogModel.CreateDocument(inputBlog);
  }

  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }

  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findById(id).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result: BlogDocument | null =
      await this.BlogModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async deleteAll(): Promise<void> {
    await this.BlogModel.deleteMany();
  }
}
