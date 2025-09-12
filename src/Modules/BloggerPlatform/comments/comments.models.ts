import { likeStatus } from '../likes/likes.models';
import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Length } from 'class-validator';

export class CommentInputModel {
  @Length(1, 1000)
  content: string;
}

class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;
}

const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);
CommentatorInfoSchema.loadClass(CommentatorInfo);

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 2000 })
  content: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: CommentatorInfoSchema, required: true, _id: false })
  commentatorInfo: CommentatorInfo;

  readonly createdAt: Date;

  static CreateDocument(
    postId: string,
    input: CommentInputModel,
    commentatorInfo: CommentatorInfo,
  ): CommentDocument {
    const comment = new this();
    comment.content = input.content;
    comment.postId = postId;
    comment.commentatorInfo = commentatorInfo;
    return comment as CommentDocument;
  }

  mapToViewModel(this: CommentDocument, lInfo: likesInfo): CommentViewModel {
    return {
      id: this._id.toString(),
      content: this.content,
      commentatorInfo: {
        userId: this.commentatorInfo.userId,
        userLogin: this.commentatorInfo.userLogin,
      },
      createdAt: this.createdAt.toISOString(),
      likesInfo: lInfo,
    };
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: likesInfo;
};

export type likesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatus;
};
