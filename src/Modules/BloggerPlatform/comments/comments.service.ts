import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { TokenService } from '../../JWT/jwt.service';
import { UsersRepository } from '../../AuthModule/users/users.repository';
import {
  Like,
  LikeDocument,
  type LikeModelType,
  likeStatus,
} from '../likes/likes.models';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../../AuthModule/users/users.models';
import { LikesRepository } from '../likes/likes.repository';

@Injectable()
export class CommentsService {
  constructor(
    private readonly repository: CommentsRepository,
    private readonly likesRepository: LikesRepository,
    private readonly authToken: TokenService,
    private readonly usersRepository: UsersRepository,
    @InjectModel(Like.name) private readonly LikeModel: LikeModelType,
  ) {}

  async checkOwnership(commentId: string, token: string): Promise<boolean> {
    const masterId = (await this.repository.findById(commentId))
      ?.commentatorInfo.userId;
    if (!masterId) throw new NotFoundException();
    const userId = this.authToken.extractJWTPayload(token)?.userId as string;
    return masterId === userId;
  }

  async changeLikeStatus(
    commentId: string,
    token: string,
    status: likeStatus,
  ): Promise<boolean> {
    const userId = this.authToken.extractJWTPayload(token).userId as string;
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
        userId: user._id.toString(),
        login: user.login,
        targetId: commentId,
        status: status,
        createdAt: Date.now(),
      });
    }
    return this.likesRepository.save(like);
  }
}
