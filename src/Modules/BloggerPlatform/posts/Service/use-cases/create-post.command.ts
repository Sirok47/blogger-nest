import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Post,
  PostDocument,
  PostInputModel,
  type PostModelType,
  PostViewModel,
} from '../../posts.models';
import { InjectModel } from '@nestjs/mongoose';
import { Inject } from '@nestjs/common';
import {
  type IPostsQueryRepo,
  type IPostsRepository,
  POSTS_QUERY_REPO,
  POSTS_REPOSITORY,
} from '../posts.service';
import {
  BLOGS_REPOSITORY,
  type IBlogsRepository,
} from '../../../blogs/Service/blogs.service';

export class CreatePostCommand {
  constructor(public readonly post: PostInputModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(POSTS_REPOSITORY)
    private readonly postsRepository: IPostsRepository,
    @Inject(BLOGS_REPOSITORY)
    private readonly blogsRepository: IBlogsRepository,
    @Inject(POSTS_QUERY_REPO)
    private readonly postsQueryRepo: IPostsQueryRepo,
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostViewModel | null> {
    const { post } = command;
    const newPost: PostDocument = await this.PostModel.CreateDocument(
      post,
      this.blogsRepository,
    );
    const insertedPost: PostDocument = await this.postsRepository.save(newPost);
    if (!insertedPost.id) return null;
    return await this.postsQueryRepo.findById(insertedPost.id, '');
  }
}
