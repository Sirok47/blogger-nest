import { Injectable } from '@nestjs/common';
import { ILikesRepository, Like, LikePSQL, LikeStatus } from '../likes.models';
import { LikesInfo } from '../../comments/comments.models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../AuthModule/users/users.models';
import { SortDirections } from '../../../../Models/paginator.models';

@Injectable()
export class LikesRepositoryPSQL implements ILikesRepository {
  constructor(
    @InjectRepository(LikePSQL)
    private readonly repo: Repository<LikePSQL>,
  ) {}

  create(user: User, targetId: string, status: LikeStatus): Like {
    return LikePSQL.CreateDoc(user, targetId, status);
  }

  async save(like: LikePSQL): Promise<LikePSQL> {
    return this.repo.save(like);
  }

  async getLike(commentId: string, userId: string): Promise<LikePSQL | null> {
    return this.repo.findOneBy({ userId: userId, targetId: commentId });
  }

  async countLikesOf(targetId: string): Promise<number> {
    return this.repo.count({
      where: { targetId: targetId, status: LikeStatus.Like },
    });
  }

  async countDislikesOf(targetId: string): Promise<number> {
    return this.repo.count({
      where: { targetId: targetId, status: LikeStatus.Dislike },
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

  async getLatestLikes(postId: string): Promise<LikePSQL[]> {
    return this.repo.find({
      relations: { user: true },
      where: { targetId: postId, status: LikeStatus.Like },
      order: { createdAt: SortDirections.desc },
      take: 3,
    });
  }

  async deleteAll() {
    await this.repo.deleteAll();
  }
}
