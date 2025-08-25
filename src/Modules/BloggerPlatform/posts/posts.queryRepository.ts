import { Injectable } from '@nestjs/common';
import {
  Post,
  PostDocument,
  type PostModelType,
  PostViewModel,
} from './posts.models';
import { InjectModel } from '@nestjs/mongoose';
import { Paginated, Paginator } from '../../../Models/paginator.models';

@Injectable()
export class PostsQueryRepo {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
  async findWithSearchAndPagination(
    blogId: string,
    paginationSettings: Paginator,
  ): Promise<Paginated<PostViewModel>> {
    const filter = blogId ? { blogId: blogId } : {};
    const query = this.PostModel.find(filter);
    const totalCount = await this.PostModel.countDocuments(filter).exec();

    let posts: PostDocument[];
    if (!paginationSettings) {
      posts = await query.exec();
    } else {
      posts = await paginationSettings.LimitQuery<PostDocument>(query).exec();
    }

    return paginationSettings.Paginate(
      totalCount,
      posts.flatMap(
        (post: PostDocument): PostViewModel => post.mapToViewModel(),
      ),
    );
  }

  async findById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findById(id).exec();
  }
}
