import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import { User, UserMongo, UserPSQL } from '../../AuthModule/users/users.models';
import { LikesInfo } from '../comments/comments.models';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export class LikeInputModel {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}

export interface Like {
  id: string;
  userId: string;
  targetId: string;
  status: LikeStatus;
  readonly createdAt: Date;
}

@Schema({ timestamps: true })
export class LikeMongo implements Like {
  readonly id: string;

  @Prop({ type: String, required: true, min: 1, max: 100 })
  userId: string;

  @Prop({ type: mongoose.Types.ObjectId, required: true, ref: 'User' })
  user: mongoose.Types.ObjectId | UserMongo;

  @Prop({ type: String, required: true, min: 1, max: 100 })
  targetId: string;

  @Prop({ type: String, required: true, min: 1, max: 10 })
  status: LikeStatus;

  readonly createdAt: Date;

  static CreateDoc(
    user: User,
    targetId: string,
    status: LikeStatus,
  ): LikeDocument {
    const like = new this();
    like.userId = user.id;
    like.user = new mongoose.Types.ObjectId(user.id);
    like.targetId = targetId;
    like.status = status;
    return like as LikeDocument;
  }
}

export const LikeSchema = SchemaFactory.createForClass(LikeMongo);
LikeSchema.loadClass(LikeMongo);

export type LikeDocument = HydratedDocument<LikeMongo>;
export type LikeModelType = Model<LikeDocument> & typeof LikeMongo;

@Entity('Likes')
export class LikePSQL extends BaseEntity implements Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserPSQL, (user) => user.likes)
  user: UserPSQL;
  @Column()
  userId: string;

  @Column('varchar', { length: 100 })
  targetId: string;

  @Column('enum', { enum: LikeStatus })
  status: LikeStatus;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  static CreateDoc(user: User, targetId: string, status: LikeStatus): LikePSQL {
    const like = new this();
    like.userId = user.id;
    like.targetId = targetId;
    like.status = status;
    return like;
  }
}

export interface ILikesRepository {
  create(user: User, targetId: string, status: LikeStatus): Like;

  save(like: Like): Promise<Like>;

  getLike(commentId: string, userId: string): Promise<Like | null>;

  countLikesOf(targetId: string): Promise<number>;

  countDislikesOf(targetId: string): Promise<number>;

  gatherLikesInfoOf(targetId: string, userId: string): Promise<LikesInfo>;

  deleteAll(): Promise<void>;
}

export const LIKES_REPOSITORY = Symbol('ILikesRepository');
