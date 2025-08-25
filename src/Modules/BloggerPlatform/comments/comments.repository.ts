import { InjectModel } from '@nestjs/mongoose';
import { Comment, type CommentModelType } from './comments.models';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async deleteAll(): Promise<void> {
    await this.CommentModel.deleteMany();
  }
}
