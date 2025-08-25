import { likeStatus } from '../likes/likes.models';
import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class CommentInputModel {
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

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  readonly createdAt: Date;

  constructor(
    postId: string,
    input: CommentInputModel,
    commentatorInfo: CommentatorInfo,
  ) {
    this.content = input.content;
    this.postId = postId;
    this.commentatorInfo = commentatorInfo;
  }

  static CreateDocument(
    postId: string,
    input: CommentInputModel,
    commentatorInfo: CommentatorInfo,
  ): CommentDocument {
    return new this(postId, input, commentatorInfo) as CommentDocument;
  }

  mapToViewModel(this: CommentDocument): CommentViewModel {
    return {
      content: this.content,
      postId: this.postId,
      commentatorInfo: this.commentatorInfo,
      createdAt: this.createdAt.toISOString(),
      //TODO: Подтянуть лайки
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
      },
    };
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;

export type CommentViewModel = {
  content: string;
  postId: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: likesInfo;
};

export type likesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatus;
};
