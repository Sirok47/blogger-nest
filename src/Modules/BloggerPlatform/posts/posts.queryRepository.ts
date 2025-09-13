import { Injectable } from '@nestjs/common';
import {
  Post,
  PostDocument,
  type PostModelType,
  PostViewModel,
} from './posts.models';
import { InjectModel } from '@nestjs/mongoose';
import { Paginated, Paginator } from '../../../Models/paginator.models';
import { likesInfo } from '../comments/comments.models';
import { LikeDocument } from '../likes/likes.models';
import { LikesRepository } from '../likes/likes.repository';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
    private readonly likesRepo: LikesRepository,
  ) {}
  async findWithSearchAndPagination(
    blogId: string,
    paginationSettings: Paginator,
    userId: string,
  ): Promise<Paginated<PostViewModel>> {
    const filter = blogId ? { blogId: blogId } : {};
    const query = this.PostModel.find(filter);
    const totalCount = await this.PostModel.countDocuments(filter).exec();

    const posts: PostDocument[] = await paginationSettings
      .QueryForPage<PostDocument>(query)
      .exec();

    const postsVM: PostViewModel[] = [];
    for (const post of posts) {
      const postId: string = post._id.toString();
      const likeInfo: likesInfo = await this.likesRepo.gatherLikesInfoOf(
        post._id.toString(),
        userId,
      );
      const latestLikes: LikeDocument[] =
        await this.likesRepo.getLatestLikes(postId);
      postsVM.push(post.mapToViewModel(likeInfo, latestLikes));
    }

    return paginationSettings.Paginate(totalCount, postsVM);
  }

  async findById(
    id: string,
    userId: string = '',
  ): Promise<PostViewModel | null> {
    const post: PostDocument | null = await this.PostModel.findById(id).exec();
    if (!post) return null;
    const postId: string = post._id.toString();
    const likeInfo: likesInfo = await this.likesRepo.gatherLikesInfoOf(
      post._id.toString(),
      userId,
    );
    const latestLikes: LikeDocument[] =
      await this.likesRepo.getLatestLikes(postId);
    return post.mapToViewModel(likeInfo, latestLikes);
  }
}
