import { BlogsRepository } from './blogs.repository';
import {
  Blog,
  BlogDocument,
  BlogInputModel,
  type BlogModelType,
  BlogViewModel,
} from './blogs.models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsService {
  constructor(
    protected repository: BlogsRepository,
    @InjectModel(Blog.name) protected BlogModel: BlogModelType,
  ) {}

  async postOneBlog(blog: BlogInputModel): Promise<BlogViewModel> {
    const newBlog: BlogDocument = this.BlogModel.CreateDocument(blog);
    const insertedBlog: BlogDocument = await this.repository.save(newBlog);
    if (!insertedBlog) {
      throw new Error('Failed to add a blog');
    }
    return insertedBlog.mapToViewModel();
  }

  async putOneBlog(id: string, newBlog: BlogInputModel): Promise<boolean> {
    const blogToUpdate: BlogDocument | null =
      await this.repository.findById(id);
    if (!blogToUpdate) {
      return false;
    }
    blogToUpdate.Update(newBlog);
    return !!(await this.repository.save(blogToUpdate));
  }

  async deleteOneBlog(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
