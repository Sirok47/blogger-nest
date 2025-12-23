import { Injectable } from '@nestjs/common';
import {
  ILikesRepository,
  Like,
  LikeDocument,
  type LikeModelType,
  LikeMongo,
  LikeStatus,
} from '../likes.entity';
import { SortDirections } from '../../../../Models/paginator.models';
import { InjectModel } from '@nestjs/mongoose';
import { LikesInfo } from '../../comments/comments.entity';
import { User } from '../../../AuthModule/users/users.entity';

@Injectable()
export class LikesRepository implements ILikesRepository {
  constructor(@InjectModel(LikeMongo.name) private LikeModel: LikeModelType) {}

  create(user: User, targetId: string, status: LikeStatus): Like {
    return this.LikeModel.CreateDoc(user, targetId, status);
  }

  async save(like: LikeDocument): Promise<LikeDocument> {
    return like.save();
  }

  async getLike(
    commentId: string,
    userId: string,
  ): Promise<LikeDocument | null> {
    return await this.LikeModel.findOne({
      targetId: commentId,
      userId: userId,
    }).exec();
  }

  async countLikesOf(targetId: string): Promise<number> {
    return this.LikeModel.countDocuments({
      status: LikeStatus.Like,
      targetId: targetId,
    });
  }

  async countDislikesOf(targetId: string): Promise<number> {
    return this.LikeModel.countDocuments({
      status: LikeStatus.Dislike,
      targetId: targetId,
    });
  }

  async gatherLikesInfoOf(
    targetId: string,
    userId: string,
  ): Promise<LikesInfo> {
    return {
      likesCount: await this.countLikesOf(targetId),
      dislikesCount: await this.countDislikesOf(targetId),
      myStatus: userId
        ? ((await this.getLike(targetId, userId))?.status ?? LikeStatus.None)
        : LikeStatus.None,
    };
  }

  async getLatestLikes(postId: string): Promise<LikeDocument[]> {
    return await this.LikeModel.find({ targetId: postId, status: 'Like' })
      .sort({ createdAt: SortDirections.desc })
      .limit(3)
      .populate('user')
      .exec();
  }

  async deleteAll() {
    await this.LikeModel.deleteMany({});
  }
}
