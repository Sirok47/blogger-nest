import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

@Schema({ timestamps: true })
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

  static CreateDoc(
    user: UserDocument,
    targetId: string,
    status: likeStatus,
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
