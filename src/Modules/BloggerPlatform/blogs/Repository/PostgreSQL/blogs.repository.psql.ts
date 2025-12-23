import { Injectable } from '@nestjs/common';
import { BlogInputModel, BlogPSQL } from '../../blogs.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBlogsRepository } from '../../Service/blogs.service';

@Injectable()
export class BlogsRepositoryPSQL implements IBlogsRepository {
  constructor(
    @InjectRepository(BlogPSQL) private readonly repo: Repository<BlogPSQL>,
  ) {}

  create(inputBlog: BlogInputModel): BlogPSQL {
    return BlogPSQL.CreateDocument(inputBlog);
  }

  async save(blog: BlogPSQL): Promise<BlogPSQL> {
    return this.repo.save(blog);
  }

  async findById(id: string): Promise<BlogPSQL | null> {
    return this.repo.findOneBy({ id: id });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return !!result.affected;
  }

  async deleteAll(): Promise<void> {
    await this.repo.deleteAll();
  }

  async findRandom(): Promise<BlogPSQL | null> {
    return this.repo.findOneBy({});
  }
}
