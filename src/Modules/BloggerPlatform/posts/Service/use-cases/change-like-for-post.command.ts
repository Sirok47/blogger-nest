import {
  type ILikesRepository,
  Like,
  LikeDocument,
  type LikeModelType,
  LIKES_REPOSITORY,
  LikeStatus,
} from '../../../likes/likes.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokenService } from '../../../../JWT/jwt.service';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../../../../AuthModule/users/users.models';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../../AuthModule/users/Service/users.service';
import { Inject } from '@nestjs/common';
import { type IPostsRepository, POSTS_REPOSITORY } from '../posts.service';

export class ChangeLikeForPostCommand {
  constructor(
    public readonly postId: string,
    public readonly status: LikeStatus,
    public readonly userToken: string,
  ) {}
}

@CommandHandler(ChangeLikeForPostCommand)
export class ChangeLikeForPostHandler
  implements ICommandHandler<ChangeLikeForPostCommand>
{
  constructor(
    @Inject(POSTS_REPOSITORY)
    private readonly repository: IPostsRepository,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    @Inject(LIKES_REPOSITORY)
    private readonly likesRepository: ILikesRepository,
    private readonly authToken: TokenService,
    @InjectModel(Like.name) private readonly LikeModel: LikeModelType,
  ) {}

  async execute({
    postId,
    status,
    userToken,
  }: ChangeLikeForPostCommand): Promise<boolean> {
    const userId: string = this.authToken.extractJWTPayload(userToken)
      .userId as string;
    const user: UserDocument | null =
      await this.usersRepository.findById(userId);
    if (postId !== (await this.repository.findById(postId))?.id || !user)
      return false;
    let like: LikeDocument | null = await this.likesRepository.getLike(
      postId,
      userId,
    );
    if (like) {
      like.status = status;
    } else {
      like = this.LikeModel.CreateDoc(user, postId, status);
    }
    return this.likesRepository.save(like);
  }
}
