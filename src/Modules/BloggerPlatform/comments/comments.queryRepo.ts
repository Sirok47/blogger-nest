import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  type CommentModelType,
  CommentViewModel,
} from './comments.models';
import { Paginated, Paginator } from '../../../Models/paginator.models';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async findWithSearchAndPagination(
    postId: string,
    paginationSettings: Paginator,
  ): Promise<Paginated<CommentViewModel>> {
    const filter = { postId: postId };

    const query = this.CommentModel.find(filter);
    const totalCount: number =
      await this.CommentModel.countDocuments(filter).exec();

    let comments: CommentDocument[];
    if (!paginationSettings) {
      comments = await query.exec();
    } else {
      comments = await paginationSettings
        .LimitQuery<CommentDocument>(query)
        .exec();
    }

    return paginationSettings.Paginate<CommentViewModel>(
      totalCount,
      comments.map(
        (comment: CommentDocument): CommentViewModel =>
          comment.mapToViewModel(),
      ),
    );
  }

  async findById(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findById(id).exec();
  }
}
