import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  BlogInputModel,
  type BlogModelType,
  BlogViewModel,
} from '../../blogs.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../blogs.repository';

export class CreateBlogCommand {
  constructor(public readonly blog: BlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private readonly BlogModel: BlogModelType,
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewModel> {
    const { blog } = command;
    const newBlog: BlogDocument = this.BlogModel.CreateDocument(blog);
    const insertedBlog: BlogDocument = await this.blogsRepository.save(newBlog);

    if (!insertedBlog) {
      throw new Error('Failed to add a blog');
    }

    return insertedBlog.mapToViewModel();
  }
}
