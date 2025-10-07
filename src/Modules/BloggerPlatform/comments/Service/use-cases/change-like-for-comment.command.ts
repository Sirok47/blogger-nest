import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { TokenService } from '../../../../JWT/jwt.service';
import {
  type ILikesRepository,
  Like,
  LikeDocument,
  type LikeModelType,
  LIKES_REPOSITORY,
  LikeStatus,
} from '../../../likes/likes.models';
import { UserDocument } from '../../../../AuthModule/users/users.models';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../../AuthModule/users/Service/users.service';
import { Inject } from '@nestjs/common';
import {
  COMMENTS_REPOSITORY,
  type ICommentsRepository,
} from '../comments.service';

export class ChangeLikeForCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly status: LikeStatus,
    public readonly userToken: string,
  ) {}
}

@CommandHandler(ChangeLikeForCommentCommand)
export class ChangeLikeForCommentHandler
  implements ICommandHandler<ChangeLikeForCommentCommand>
{
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly repository: ICommentsRepository,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    @Inject(LIKES_REPOSITORY)
    private readonly likesRepository: ILikesRepository,
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
      like = this.LikeModel.CreateDoc(user, commentId, status);
    }
    return this.likesRepository.save(like);
  }
}
