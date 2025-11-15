import { Injectable } from '@nestjs/common';
import {
  PostDocument,
  PostInputModel,
  type PostModelType,
  PostMongo,
} from '../../posts.models';
import { InjectModel } from '@nestjs/mongoose';
import { IPostsRepository } from '../../Service/posts.service';
import { BlogsRepository } from '../../../blogs/Repository/MongoDB/blogs.repository';

@Injectable()
export class PostsRepository implements IPostsRepository {
  constructor(@InjectModel(PostMongo.name) private PostModel: PostModelType) {}

  create(
    inputPost: PostInputModel,
    blogRepo: BlogsRepository,
  ): Promise<PostDocument> {
    return this.PostModel.CreateDocument(inputPost, blogRepo);
  }

  async save(post: PostDocument): Promise<PostDocument> {
    return post.save();
  }

  async findById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findById(id).exec();
  }

  async delete(id: string): Promise<boolean> {
    return !!(await this.PostModel.findByIdAndDelete(id));
  }

  async deleteAll(): Promise<void> {
    await this.PostModel.deleteMany();
  }
}
