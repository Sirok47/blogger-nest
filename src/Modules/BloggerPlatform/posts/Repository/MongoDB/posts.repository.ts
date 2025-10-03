import { Injectable } from '@nestjs/common';
import { Post, PostDocument, type PostModelType } from '../../posts.models';
import { InjectModel } from '@nestjs/mongoose';
import { IPostsRepository } from '../../Service/posts.service';

@Injectable()
export class PostsRepository implements IPostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

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
