import { Post, PostInputModel } from '../../posts.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly newPost: PostInputModel,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @Inject(POSTS_REPOSITORY)
    private readonly postsRepository: IPostsRepository,
    @Inject(BLOGS_REPOSITORY)
    private readonly blogsRepository: IBlogsRepository,
    @Inject(POSTS_QUERY_REPO)
    private readonly postsQueryRepo: IPostsQueryRepo,
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    const { id, newPost } = command;
    const postToUpdate: Post | null = await this.postsRepository.findById(id);
    if (!postToUpdate) return false;

    postToUpdate.title = newPost.title;
    postToUpdate.shortDescription = newPost.shortDescription;
    postToUpdate.content = newPost.content;

    const updatedPost = await this.postsRepository.save(postToUpdate);
    return !(await this.postsQueryRepo.findById(updatedPost.id, ''));
  }
}
