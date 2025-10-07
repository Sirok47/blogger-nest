import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TokenService } from '../../../JWT/jwt.service';
import {
  type ILikesRepository,
  Like,
  LikeDocument,
  type LikeModelType,
  LIKES_REPOSITORY,
  LikeStatus,
} from '../../likes/likes.models';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../../../AuthModule/users/users.models';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../AuthModule/users/Service/users.service';
import { CommentDocument, CommentViewModel } from '../comments.models';
import { Paginated, Paginator } from '../../../../Models/paginator.models';

export interface ICommentsQueryRepo {
  findWithSearchAndPagination(
    postId: string,
    paginationSettings: Paginator,
    userId: string,
  ): Promise<Paginated<CommentViewModel>>;

  findById(id: string, userId: string): Promise<CommentViewModel | null>;
}

export const COMMENTS_QUERY_REPO = Symbol('ICommentsQueryRepo');

export interface ICommentsRepository {
  save(comment: CommentDocument): Promise<CommentDocument>;

  findById(id: string): Promise<CommentDocument | null>;

  delete(id: string): Promise<boolean>;

  deleteAll(): Promise<void>;
}

export const COMMENTS_REPOSITORY = Symbol('ICommentsRepository');

@Injectable()
export class CommentsService {
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly repository: ICommentsRepository,
    @Inject(LIKES_REPOSITORY)
    private readonly likesRepository: ILikesRepository,
    private readonly authToken: TokenService,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
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
    status: LikeStatus,
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
