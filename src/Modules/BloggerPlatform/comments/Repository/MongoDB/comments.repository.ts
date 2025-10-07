import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  type CommentModelType,
} from '../../comments.models';
import { Injectable } from '@nestjs/common';
import { ICommentsRepository } from '../../Service/comments.service';

@Injectable()
export class CommentsRepository implements ICommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

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
