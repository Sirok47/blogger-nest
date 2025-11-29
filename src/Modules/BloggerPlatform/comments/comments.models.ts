import { LikeStatus } from '../likes/likes.models';
import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Length } from 'class-validator';
import { User, UserPSQL } from '../../AuthModule/users/users.models';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostPSQL } from '../posts/posts.models';

export class CommentInputModel {
  @Length(20, 300)
  content: string;
}

export class CommentatorInfo {
  userId: string;
  userLogin: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  commentatorId: string;
  readonly createdAt: Date;

  mapToViewModel(
    this: Comment,
    lInfo: LikesInfo,
    userInfo: User,
  ): CommentViewModel;
}

@Schema({ timestamps: true })
export class CommentMongo implements Comment {
  readonly id: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 2000 })
  content: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  commentatorId: string;

  readonly createdAt: Date;

  static CreateDocument(
    postId: string,
    input: CommentInputModel,
    commentatorInfo: CommentatorInfo,
  ): CommentDocument {
    const comment = new this();
    comment.content = input.content;
    comment.postId = postId;
    comment.commentatorId = commentatorInfo.userId;
    return comment as CommentDocument;
  }

  mapToViewModel(
    this: Comment,
    lInfo: LikesInfo,
    userInfo: User,
  ): CommentViewModel {
    return {
      id: this.id,
      content: this.content,
      commentatorInfo: {
        userId: userInfo.id,
        userLogin: userInfo.login,
      },
      createdAt: this.createdAt.toISOString(),
      likesInfo: lInfo,
    };
  }
}

export const CommentSchema = SchemaFactory.createForClass(CommentMongo);
CommentSchema.loadClass(CommentMongo);

export type CommentDocument = HydratedDocument<CommentMongo>;
export type CommentModelType = Model<CommentDocument> & typeof CommentMongo;

@Entity('Comments')
export class CommentPSQL implements Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 2000 })
  content: string;

  @ManyToOne(() => PostPSQL, (post) => post.comments)
  post: PostPSQL;
  @Column()
  postId: string;

  @ManyToOne(() => UserPSQL, (user) => user.comments)
  commentator: UserPSQL;
  @Column()
  commentatorId: string;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  static CreateDocument(
    postId: string,
    input: CommentInputModel,
    commentatorInfo: CommentatorInfo,
  ): CommentPSQL {
    const comment = new this();
    comment.content = input.content;
    comment.postId = postId;
    comment.commentatorId = commentatorInfo.userId;
    return comment;
  }

  mapToViewModel(
    this: Comment,
    lInfo: LikesInfo,
    userInfo: User,
  ): CommentViewModel {
    return {
      id: this.id,
      content: this.content,
      commentatorInfo: {
        userId: userInfo.id,
        userLogin: userInfo.login,
      },
      createdAt: this.createdAt.toISOString(),
      likesInfo: lInfo,
    };
  }

  static mapSQLToViewModel(
    comment: Comment,
    lInfo: LikesInfo,
    userInfo: User,
  ): CommentViewModel {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: userInfo.id,
        userLogin: userInfo.login,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: lInfo,
    };
  }
}

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
};

export type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};
