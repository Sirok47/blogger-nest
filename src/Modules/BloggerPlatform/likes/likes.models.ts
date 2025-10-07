import { HydratedDocument, Model } from 'mongoose';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import { UserDocument } from '../../AuthModule/users/users.models';
import { LikesInfo } from '../comments/comments.models';
import { SortDirections } from '../../../Models/paginator.models';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export class LikeInputModel {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: String, required: true, min: 1, max: 100 })
  userId: string;

  @Prop({ type: String, required: true, min: 1, max: 100 })
  login: string;

  @Prop({ type: String, required: true, min: 1, max: 100 })
  targetId: string;

  @Prop({ type: String, required: true, min: 1, max: 10 })
  status: LikeStatus;

  readonly createdAt: Date;

  static CreateDoc(
    user: UserDocument,
    targetId: string,
    status: LikeStatus,
  ): LikeDocument {
    const like = new this();
    like.userId = user.id as string;
    like.login = user.login;
    like.targetId = targetId;
    like.status = status;
    return like as LikeDocument;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;
export type LikeModelType = Model<LikeDocument> & typeof Like;

export interface ILikesRepository {
  save(like: LikeDocument);

  getLike(commentId: string, userId: string): Promise<LikeDocument | null>;

  countLikesOf(targetId: string): Promise<number>;

  countDislikesOf(targetId: string): Promise<number>;

  gatherLikesInfoOf(targetId: string, userId: string): Promise<LikesInfo>;

  getLatestLikes(postId: string): Promise<LikeDocument[]>;

  deleteAll();
}

export const LIKES_REPOSITORY = Symbol('ILikesRepository');
