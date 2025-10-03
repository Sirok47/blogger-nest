import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BLOGS_REPOSITORY, type IBlogsRepository } from '../blogs.service';
import { Inject } from '@nestjs/common';

export class DeleteBlogCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogHandler implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    @Inject(BLOGS_REPOSITORY)
    private readonly blogsRepository: IBlogsRepository,
  ) {}

  async execute(command: DeleteBlogCommand): Promise<boolean> {
    return this.blogsRepository.delete(command.id);
  }
}
