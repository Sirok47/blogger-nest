import { Injectable } from '@nestjs/common';
import { IPostsRepository } from '../../Service/posts.service';
import { PostDocument, PostInputModel, PostPSQL } from '../../posts.models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsRepositoryPSQL } from '../../../blogs/Repository/PostgreSQL/blogs.repository.psql';

@Injectable()
export class PostsRepositoryPSQL implements IPostsRepository {
  constructor(
    @InjectRepository(PostPSQL) private readonly repo: Repository<PostPSQL>,
  ) {}

  create(
    inputPost: PostInputModel,
    blogRepo: BlogsRepositoryPSQL,
  ): Promise<PostPSQL> {
    return PostPSQL.CreateDocument(inputPost, blogRepo);
  }

  async save(post: PostDocument): Promise<PostDocument> {
    return this.repo.save(post);
  }

  async findById(id: string): Promise<PostPSQL | null> {
    return this.repo.findOneBy({ id: id });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return !!result.affected;
  }

  async deleteAll(): Promise<void> {
    await this.repo.deleteAll();
  }
}
