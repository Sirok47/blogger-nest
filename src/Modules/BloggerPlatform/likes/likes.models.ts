import { HydratedDocument, Model } from 'mongoose';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import { UserDocument } from '../../AuthModule/users/users.models';

export enum likeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export class LikeInputModel {
  @IsEnum(likeStatus)
  likeStatus: likeStatus;
}

export class Like {
  @Prop({ type: String, required: true, min: 1, max: 100 })
  userId: string;

  @Prop({ type: String, required: true, min: 1, max: 100 })
  login: string;

  @Prop({ type: String, required: true, min: 1, max: 100 })
  targetId: string;

  @Prop({ type: String, required: true, min: 1, max: 10 })
  status: likeStatus;

  readonly createdAt: Date;

  constructor(user: UserDocument, targetId: string, status: likeStatus) {
    this.userId = user.id as string;
    this.login = user.login;
    this.targetId = targetId;
    this.status = status;
    this.createdAt = new Date();
  }

  static CreateDoc(
    user: UserDocument,
    targetId: string,
    status: likeStatus,
  ): LikeDocument {
    return new this(user, targetId, status) as LikeDocument;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;
export type LikeModelType = Model<LikeDocument> & typeof Like;
