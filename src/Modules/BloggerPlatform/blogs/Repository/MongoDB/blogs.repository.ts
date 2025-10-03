import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, type BlogModelType } from '../../blogs.models';
import { IBlogsRepository } from '../../Service/blogs.service';

@Injectable()
export class BlogsRepository implements IBlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

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
