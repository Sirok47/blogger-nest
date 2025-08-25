import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/blogs.models';
import { BlogsQueryRepo } from './blogs/blogs.queryRepo';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { PostsQueryRepo } from './posts/posts.queryRepository';
import { PostsController } from './posts/posts.controller';
import { Post, PostSchema } from './posts/posts.models';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsQueryRepo } from './comments/comments.queryRepo';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { Comment, CommentSchema } from './comments/comments.models';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepo,
    PostsService,
    PostsRepository,
    PostsQueryRepo,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepo,
  ],
  exports: [BlogsRepository, PostsRepository, CommentsRepository],
})
export class BloggerPlatformModule {}
