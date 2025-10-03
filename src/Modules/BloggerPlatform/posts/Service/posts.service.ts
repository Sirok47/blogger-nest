import { Inject, Injectable } from '@nestjs/common';
import {
  Post,
  PostDocument,
  type PostModelType,
  PostViewModel,
} from '../posts.models';
import { InjectModel } from '@nestjs/mongoose';
import { Paginated, Paginator } from '../../../../Models/paginator.models';
import {
  BLOGS_REPOSITORY,
  type IBlogsRepository,
} from '../../blogs/Service/blogs.service';

/*changeLikeStatus = async (
    postId: string,
    token: string,
    status: likeStatus,
  ): Promise<boolean> => {
    const userId: string = authToken.extractJWTPayload(token).userId;
    const user: UserDocument | null = await container
      .get(UsersRepository)
      .findById(userId);
    if (postId !== (await this.repository.findById(postId))?.id || !user)
      return false;
    let like: LikeDocument | null = await container
      .get(LikesRepository)
      .getLike(postId, userId);
    if (like) {
      like.status = status;
    } else {
      like = new LikeModel({
        userId: user.id,
        login: user.login,
        targetId: postId,
        status: status,
        createdAt: Date.now(),
      });
    }
    return container.get(LikesRepository).save(like);
  };*/

export interface IPostsRepository {
  save(post: PostDocument): Promise<PostDocument>;

  findById(id: string): Promise<PostDocument | null>;

  delete(id: string): Promise<boolean>;

  deleteAll(): Promise<void>;
}

export const POSTS_REPOSITORY = Symbol('IPostsRepository');

export interface IPostsQueryRepo {
  findWithSearchAndPagination(
    blogId: string,
    paginationSettings: Paginator,
    userId: string,
  ): Promise<Paginated<PostViewModel>>;

  findById(id: string, userId: string): Promise<PostViewModel | null>;
}

export const POSTS_QUERY_REPO = Symbol('IPostsQueryRepo');

@Injectable()
export class PostsService {
  constructor(
    @Inject(POSTS_REPOSITORY)
    private repository: IPostsRepository,
    @InjectModel(Post.name) protected PostModel: PostModelType,
    @Inject(BLOGS_REPOSITORY)
    private blogsRepository: IBlogsRepository,
  ) {}
}
