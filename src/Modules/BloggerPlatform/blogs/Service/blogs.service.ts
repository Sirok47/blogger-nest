import { BlogsRepository } from '../blogs.repository';
import { Blog, type BlogModelType } from '../blogs.models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsService {
  constructor(
    protected repository: BlogsRepository,
    @InjectModel(Blog.name) protected BlogModel: BlogModelType,
  ) {}
}
