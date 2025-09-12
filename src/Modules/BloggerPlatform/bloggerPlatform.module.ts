import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/Service/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/blogs.models';
import { BlogsQueryRepo } from './blogs/blogs.queryRepo';
import { PostsService } from './posts/Service/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { PostsQueryRepo } from './posts/posts.queryRepository';
import { PostsController } from './posts/posts.controller';
import { Post, PostSchema } from './posts/posts.models';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsQueryRepo } from './comments/comments.queryRepo';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { Comment, CommentSchema } from './comments/comments.models';
import { CreateBlogHandler } from './blogs/Service/use-cases/create-blog.command';
import { UpdateBlogHandler } from './blogs/Service/use-cases/update-blog.command';
import { DeleteBlogHandler } from './blogs/Service/use-cases/delete-blog.command';
import { CreatePostHandler } from './posts/Service/use-cases/create-post.command';
import { UpdatePostHandler } from './posts/Service/use-cases/update-post.command';
import { DeletePostHandler } from './posts/Service/use-cases/delete-post.command';
import { Like, LikeSchema } from './likes/likes.models';
import { LikesRepository } from './likes/likes.repository';
import { TokenModule } from '../JWT/jwt.module';
import { AuthModule } from '../AuthModule/auth.module';

const BlogCommandHandlers = [
  CreateBlogHandler,
  UpdateBlogHandler,
  DeleteBlogHandler,
];

const PostCommandHandlers = [
  CreatePostHandler,
  UpdatePostHandler,
  DeletePostHandler,
];

@Module({
  imports: [
    AuthModule,
    TokenModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
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
    LikesRepository,
    ...BlogCommandHandlers,
    ...PostCommandHandlers,
  ],
  exports: [BlogsRepository, PostsRepository, CommentsRepository],
})
export class BloggerPlatformModule {}
