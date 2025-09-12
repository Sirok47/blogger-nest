import { PostDocument, PostInputModel } from '../../posts.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../posts.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly newPost: PostInputModel,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    const { id, newPost } = command;
    const postToUpdate: PostDocument | null =
      await this.postsRepository.findById(id);
    if (!postToUpdate) return false;
    postToUpdate.Update(
      newPost,
      await this.blogsRepository.findById(newPost.blogId),
    );
    return !!(await this.postsRepository.save(postToUpdate));
  }
}
