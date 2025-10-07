import { CommentDocument, CommentInputModel } from '../../comments.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  COMMENTS_REPOSITORY,
  CommentsService,
  type ICommentsRepository,
} from '../comments.service';
import { ForbiddenException, Inject } from '@nestjs/common';

export class UpdateCommentCommand {
  constructor(
    public readonly postId: string,
    public readonly comment: CommentInputModel,
    public readonly userToken: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly repository: ICommentsRepository,
    private readonly service: CommentsService,
  ) {}

  async execute({
    postId,
    comment,
    userToken,
  }: UpdateCommentCommand): Promise<boolean> {
    const isOwner = await this.service.checkOwnership(postId, userToken);
    if (!isOwner) throw new ForbiddenException();
    const commentToUpdate: CommentDocument | null =
      await this.repository.findById(postId);
    if (!commentToUpdate) return false;
    commentToUpdate.content = comment.content;
    return !!(await this.repository.save(commentToUpdate));
  }
}
