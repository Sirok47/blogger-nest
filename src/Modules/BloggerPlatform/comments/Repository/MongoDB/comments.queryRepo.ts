import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentDocument,
  type CommentModelType,
  CommentMongo,
  CommentViewModel,
  LikesInfo,
} from '../../comments.models';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import { ICommentsQueryRepo } from '../../Service/comments.service';
import {
  type ILikesRepository,
  LIKES_REPOSITORY,
} from '../../../likes/likes.models';
import { User } from '../../../../AuthModule/users/users.models';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../../AuthModule/users/Service/users.service';

@Injectable()
export class CommentsQueryRepo implements ICommentsQueryRepo {
  constructor(
    @InjectModel(CommentMongo.name)
    private readonly CommentModel: CommentModelType,
    @Inject(LIKES_REPOSITORY)
    private readonly likesRepo: ILikesRepository,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepo: IUsersRepository,
  ) {}

  async findWithSearchAndPagination(
    postId: string,
    paginationSettings: Paginator,
    userId: string,
  ): Promise<Paginated<CommentViewModel>> {
    const filter = { postId: postId };

    const query = this.CommentModel.find(filter);
    const totalCount: number =
      await this.CommentModel.countDocuments(filter).exec();

    const comments: CommentDocument[] = await paginationSettings
      .QueryForPage<CommentDocument>(query)
      .exec();

    const commentsVM: CommentViewModel[] = [];
    for (const comment of comments) {
      const likeInfo: LikesInfo = await this.likesRepo.gatherLikesInfoOf(
        comment._id.toString(),
        userId,
      );
      const userInfo: User | null = await this.usersRepo.findById(userId);
      commentsVM.push(comment.mapToViewModel(likeInfo, userInfo!));
    }

    return paginationSettings.Paginate<CommentViewModel>(
      totalCount,
      commentsVM,
    );
  }

  async findById(id: string, userId: string): Promise<CommentViewModel | null> {
    const comment: CommentDocument | null =
      await this.CommentModel.findById(id).exec();
    if (!comment) return null;
    const userInfo: User | null = await this.usersRepo.findById(userId);
    const likeInfo: LikesInfo = await this.likesRepo.gatherLikesInfoOf(
      comment._id.toString(),
      userId,
    );
    return comment.mapToViewModel(likeInfo, userInfo!);
  }
}
