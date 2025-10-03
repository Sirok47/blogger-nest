import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  BlogInputModel,
  type BlogModelType,
  BlogViewModel,
} from '../../blogs.models';
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
    @InjectModel(Blog.name) private readonly BlogModel: BlogModelType,
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewModel | null> {
    const { blog } = command;
    const newBlog: BlogDocument = this.BlogModel.CreateDocument(blog);
    const insertedBlog: BlogDocument = await this.blogsRepository.save(newBlog);
    if (!insertedBlog) {
      throw new Error('Failed to add a blog');
    }
    return await this.blogsQueryRepo.findById(insertedBlog.id);
  }
}
