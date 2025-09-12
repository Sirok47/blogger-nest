import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Post,
  PostDocument,
  PostInputModel,
  type PostModelType,
  PostViewModel,
} from '../../posts.models';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../../posts.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { likeStatus } from '../../../likes/likes.models';

export class CreatePostCommand {
  constructor(public readonly post: PostInputModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostViewModel | null> {
    const { post } = command;
    const newPost: PostDocument = await this.PostModel.CreateDocument(
      post,
      this.blogsRepository,
    );
    const insertedPost: PostDocument = await this.postsRepository.save(newPost);
    if (!insertedPost) return null;
    return insertedPost.mapToViewModel(
      {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
      },
      [],
    );
  }
}
