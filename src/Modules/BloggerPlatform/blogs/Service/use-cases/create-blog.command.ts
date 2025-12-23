import { Blog, BlogInputModel, BlogViewModel } from '../../blogs.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BLOGS_QUERY_REPO,
  BLOGS_REPOSITORY,
  type IBlogsQueryRepo,
  type IBlogsRepository,
} from '../blogs.service';
import { Inject } from '@nestjs/common';

export class CreateBlogCommand {
  constructor(public readonly blog: BlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @Inject(BLOGS_REPOSITORY)
    private readonly blogsRepository: IBlogsRepository,
    @Inject(BLOGS_QUERY_REPO)
    private readonly blogsQueryRepo: IBlogsQueryRepo,
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewModel | null> {
    const { blog } = command;
    const newBlog: Blog = this.blogsRepository.create(blog);
    const insertedBlog: Blog = await this.blogsRepository.save(newBlog);
    if (!insertedBlog) {
      throw new Error('Failed to add a blog');
    }
    return await this.blogsQueryRepo.findById(insertedBlog.id);
  }
}
