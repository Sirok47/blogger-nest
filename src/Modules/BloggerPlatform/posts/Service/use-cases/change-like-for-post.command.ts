import {
  Like,
  LikeDocument,
  type LikeModelType,
  likeStatus,
} from '../../../likes/likes.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../comments/comments.repository';
import { UsersRepository } from '../../../../AuthModule/users/users.repository';
import { LikesRepository } from '../../../likes/likes.repository';
import { TokenService } from '../../../../JWT/jwt.service';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../../../../AuthModule/users/users.models';

export class ChangeLikeForPostCommand {
  constructor(
    public readonly postId: string,
    public readonly status: likeStatus,
    public readonly userToken: string,
  ) {}
}

@CommandHandler(ChangeLikeForPostCommand)
export class ChangeLikeForPostHandler
  implements ICommandHandler<ChangeLikeForPostCommand>
{
  constructor(
    private readonly repository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly likesRepository: LikesRepository,
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
      like = new this.LikeModel({
        userId: user.id as string,
        login: user.login,
        targetId: postId,
        status: status,
        createdAt: Date.now(),
      });
    }
    return this.likesRepository.save(like);
  }
}
