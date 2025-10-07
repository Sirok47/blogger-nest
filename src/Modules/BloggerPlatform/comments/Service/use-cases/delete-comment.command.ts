import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  COMMENTS_REPOSITORY,
  CommentsService,
  type ICommentsRepository,
} from '../comments.service';
import { ForbiddenException, Inject } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userToken: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly repository: ICommentsRepository,
    private readonly service: CommentsService,
  ) {}

  async execute({
    commentId,
    userToken,
  }: DeleteCommentCommand): Promise<boolean> {
    const isOwner = await this.service.checkOwnership(commentId, userToken);
    if (!isOwner) throw new ForbiddenException();

    return this.repository.delete(commentId);
  }
}
