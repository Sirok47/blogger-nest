import { PostsRepository } from '../posts.repository';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { Injectable } from '@nestjs/common';
import { Post, type PostModelType } from '../posts.models';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsService {
  constructor(
    private repository: PostsRepository,
    @InjectModel(Post.name) protected PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
  ) {}

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
}
