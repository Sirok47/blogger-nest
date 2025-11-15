import { Injectable } from '@nestjs/common';
import {
  Comment,
  CommentatorInfo,
  CommentInputModel,
  CommentPSQL,
} from '../../comments.models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICommentsRepository } from '../../Service/comments.service';

@Injectable()
export class CommentsRepositoryPSQL implements ICommentsRepository {
  constructor(
    @InjectRepository(CommentPSQL)
    private readonly repo: Repository<CommentPSQL>,
  ) {}

  create(
    postId: string,
    input: CommentInputModel,
    commentatorInfo: CommentatorInfo,
  ): Comment {
    return CommentPSQL.CreateDocument(postId, input, commentatorInfo);
  }

  async save(comment: CommentPSQL): Promise<CommentPSQL> {
    return this.repo.save(comment);
  }

  async findById(id: string): Promise<CommentPSQL | null> {
    return this.repo.findOneBy({ id });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return !!result.affected;
  }

  async deleteAll(): Promise<void> {
    await this.repo.deleteAll();
  }
}
