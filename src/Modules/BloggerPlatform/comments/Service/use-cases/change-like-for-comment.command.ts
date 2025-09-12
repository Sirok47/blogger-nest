import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../../comments.repository';
import { UsersRepository } from '../../../../AuthModule/users/users.repository';
import { TokenService } from '../../../../JWT/jwt.service';
import {
  Like,
  LikeDocument,
  type LikeModelType,
  likeStatus,
} from '../../../likes/likes.models';
import { LikesRepository } from '../../../likes/likes.repository';
import { UserDocument } from '../../../../AuthModule/users/users.models';

export class ChangeLikeForCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly status: likeStatus,
    public readonly userToken: string,
  ) {}
}

@CommandHandler(ChangeLikeForCommentCommand)
export class ConfirmEmailHandler
  implements ICommandHandler<ChangeLikeForCommentCommand>
{
  constructor(
    private readonly repository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly likesRepository: LikesRepository,
    private readonly authToken: TokenService,
    @InjectModel(Like.name) private readonly LikeModel: LikeModelType,
  ) {}

  async execute({
    commentId,
    status,
    userToken,
  }: ChangeLikeForCommentCommand): Promise<boolean> {
    const userId: string = this.authToken.extractJWTPayload(userToken)
      .userId as string;
    const user: UserDocument | null =
      await this.usersRepository.findById(userId);
    if (commentId !== (await this.repository.findById(commentId))?.id || !user)
      return false;
    let like: LikeDocument | null = await this.likesRepository.getLike(
      commentId,
      userId,
    );
    if (like) {
      like.status = status;
    } else {
      like = new this.LikeModel({
        userId: user.id as string,
        login: user.login,
        targetId: commentId,
        status: status,
        createdAt: Date.now(),
      });
    }
    return this.likesRepository.save(like);
  }
}
