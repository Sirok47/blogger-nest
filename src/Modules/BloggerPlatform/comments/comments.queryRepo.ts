import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  type CommentModelType,
  CommentViewModel,
  likesInfo,
} from './comments.models';
import { Paginated, Paginator } from '../../../Models/paginator.models';
import { LikesRepository } from '../likes/likes.repository';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
    private readonly likesRepo: LikesRepository,
  ) {}

  async findWithSearchAndPagination(
    postId: string,
    paginationSettings: Paginator,
    userId: string = '',
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
      const likeInfo: likesInfo = await this.likesRepo.gatherLikesInfoOf(
        comment._id.toString(),
        userId,
      );
      commentsVM.push(comment.mapToViewModel(likeInfo));
    }

    return paginationSettings.Paginate<CommentViewModel>(
      totalCount,
      commentsVM,
    );
  }

  async findById(
    id: string,
    userId: string = '',
  ): Promise<CommentViewModel | null> {
    const comment: CommentDocument | null =
      await this.CommentModel.findById(id).exec();
    if (!comment) return null;
    const likeInfo: likesInfo = await this.likesRepo.gatherLikesInfoOf(
      comment._id.toString(),
      userId,
    );
    return comment.mapToViewModel(likeInfo);
  }
}
