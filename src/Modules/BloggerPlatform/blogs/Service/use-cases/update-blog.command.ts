import { BlogDocument, BlogInputModel } from '../../blogs.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BLOGS_REPOSITORY, type IBlogsRepository } from '../blogs.service';
import { Inject } from '@nestjs/common';

export class UpdateBlogCommand {
  constructor(
    public readonly id: string,
    public readonly newBlog: BlogInputModel,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    @Inject(BLOGS_REPOSITORY)
    private readonly blogsRepository: IBlogsRepository,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { id, newBlog } = command;
    const blogToUpdate: BlogDocument | null =
      await this.blogsRepository.findById(id);

    if (!blogToUpdate) {
      return false;
    }

    blogToUpdate.name = newBlog.name;
    blogToUpdate.description = newBlog.description;
    blogToUpdate.websiteUrl = newBlog.websiteUrl;

    return !!(await this.blogsRepository.save(blogToUpdate));
  }
}
