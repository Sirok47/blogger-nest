import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../comments.repository';
import { CommentsService } from '../../comments.service';
import { ForbiddenException } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(
    public readonly postId: string,
    public readonly userToken: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class ConfirmEmailHandler
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    private readonly repository: CommentsRepository,
    private readonly service: CommentsService,
  ) {}

  async execute({ postId, userToken }: DeleteCommentCommand): Promise<boolean> {
    const isOwner = await this.service.checkOwnership(postId, userToken);
    if (!isOwner) throw new ForbiddenException();

    return this.repository.delete(postId);
  }
}
