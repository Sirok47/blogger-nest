import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentatorInfo,
  CommentDocument,
  CommentInputModel,
  type CommentModelType,
  CommentMongo,
} from '../../comments.entity';
import { Injectable } from '@nestjs/common';
import { ICommentsRepository } from '../../Service/comments.service';

@Injectable()
export class CommentsRepository implements ICommentsRepository {
  constructor(
    @InjectModel(CommentMongo.name) private CommentModel: CommentModelType,
  ) {}

  create(
    postId: string,
    input: CommentInputModel,
    commentatorInfo: CommentatorInfo,
  ): Comment {
    return this.CommentModel.CreateDocument(postId, input, commentatorInfo);
  }

  async save(comment: CommentDocument): Promise<CommentDocument> {
    return comment.save();
  }

  async findById(id: string): Promise<CommentDocument | null> {
    return await this.CommentModel.findById(id).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result: CommentDocument | null =
      await this.CommentModel.findByIdAndDelete(id);
    return !!result;
  }

  async deleteAll(): Promise<void> {
    await this.CommentModel.deleteMany();
  }
}
