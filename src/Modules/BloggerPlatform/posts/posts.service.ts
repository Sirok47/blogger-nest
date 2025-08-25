import { PostsRepository } from './posts.repository';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Injectable } from '@nestjs/common';
import {
  Post,
  PostDocument,
  PostInputModel,
  type PostModelType,
  PostViewModel,
} from './posts.models';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsService {
  constructor(
    private repository: PostsRepository,
    @InjectModel(Post.name) protected PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async postOnePost(post: PostInputModel): Promise<PostViewModel | null> {
    const newPost: PostDocument = await this.PostModel.CreateDocument(
      post,
      this.blogsRepository,
    );
    const insertedPost: PostDocument = await this.repository.save(newPost);
    if (!insertedPost) return null;
    return insertedPost.mapToViewModel();
  }

  async putOnePost(id: string, newPost: PostInputModel): Promise<boolean> {
    const postToUpdate: PostDocument | null =
      await this.repository.findById(id);
    if (!postToUpdate) return false;
    await postToUpdate.Update(newPost, this.blogsRepository);
    return !!(await this.repository.save(postToUpdate));
  }

  async deleteOnePost(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

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
