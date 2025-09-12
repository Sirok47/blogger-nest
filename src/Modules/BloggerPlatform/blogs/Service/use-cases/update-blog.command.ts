import { BlogDocument, BlogInputModel } from '../../blogs.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../blogs.repository';

export class UpdateBlogCommand {
  constructor(
    public readonly id: string,
    public readonly newBlog: BlogInputModel,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { id, newBlog } = command;
    const blogToUpdate: BlogDocument | null =
      await this.blogsRepository.findById(id);

    if (!blogToUpdate) {
      return false;
    }

    blogToUpdate.Update(newBlog);
    return !!(await this.blogsRepository.save(blogToUpdate));
  }
}
