import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokenService } from '../../../../JWT/jwt.service';
import {
  type ILikesRepository,
  Like,
  LIKES_REPOSITORY,
  LikeStatus,
} from '../../../likes/likes.models';
import { User } from '../../../../AuthModule/users/users.models';
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
  ) {}

  async execute({
    commentId,
    status,
    userToken,
  }: ChangeLikeForCommentCommand): Promise<boolean> {
    const userId: string = this.authToken.extractJWTPayload(userToken)
      .userId as string;
    const user: User | null = await this.usersRepository.findById(userId);
    if (commentId !== (await this.repository.findById(commentId))?.id || !user)
      return false;
    let like: Like | null = await this.likesRepository.getLike(
      commentId,
      userId,
    );
    if (like) {
      like.status = status;
    } else {
      like = this.likesRepository.create(user, commentId, status);
    }
    return !!(await this.likesRepository.save(like));
  }
}
