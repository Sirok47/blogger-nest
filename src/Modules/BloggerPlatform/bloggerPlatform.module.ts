import { Module } from '@nestjs/common';
import { BlogsController, SABlogsController } from './blogs/blogs.controller';
import {
  BLOGS_QUERY_REPO,
  BLOGS_REPOSITORY,
  BlogsService,
} from './blogs/Service/blogs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/blogs.models';
import {
  POSTS_QUERY_REPO,
  POSTS_REPOSITORY,
  PostsService,
} from './posts/Service/posts.service';
import { PostsController, SAPostsController } from './posts/posts.controller';
import { Post, PostSchema } from './posts/posts.models';
import { CommentsController } from './comments/comments.controller';
import {
  COMMENTS_QUERY_REPO,
  COMMENTS_REPOSITORY,
  CommentsService,
} from './comments/Service/comments.service';
import { Comment, CommentSchema } from './comments/comments.models';
import { CreateBlogHandler } from './blogs/Service/use-cases/create-blog.command';
import { UpdateBlogHandler } from './blogs/Service/use-cases/update-blog.command';
import { DeleteBlogHandler } from './blogs/Service/use-cases/delete-blog.command';
import { CreatePostHandler } from './posts/Service/use-cases/create-post.command';
import { UpdatePostHandler } from './posts/Service/use-cases/update-post.command';
import { DeletePostHandler } from './posts/Service/use-cases/delete-post.command';
import { Like, LIKES_REPOSITORY, LikeSchema } from './likes/likes.models';
import { TokenModule } from '../JWT/jwt.module';
import { AuthModule } from '../AuthModule/auth.module';
import { ChangeLikeForCommentHandler } from './comments/Service/use-cases/change-like-for-comment.command';
import { DeleteCommentHandler } from './comments/Service/use-cases/delete-comment.command';
import { CreateCommentHandler } from './comments/Service/use-cases/create-comment.command';
import { UpdateCommentHandler } from './comments/Service/use-cases/update-comment.command';
import { ChangeLikeForPostHandler } from './posts/Service/use-cases/change-like-for-post.command';
import { BlogsRepositoryPSQL } from './blogs/Repository/PostgreSQL/blogs.repository.psql';
import { BlogsQueryRepoPSQL } from './blogs/Repository/PostgreSQL/blogs.queryRepo.psql';
import { PostsRepositoryPSQL } from './posts/Repository/PostgreSQL/posts.repository.psql';
import { PostsQueryRepoPSQL } from './posts/Repository/PostgreSQL/posts.queryRepo.psql';
import { CommentsRepositoryPSQL } from './comments/Repository/PostgreSQL/comments.repository.psql';
import { CommentsQueryRepoPSQL } from './comments/Repository/PostgreSQL/comments.queryRepo.psql';
import { LikesRepositoryPSQL } from './likes/likes.repository.psql';

const BlogCommandHandlers = [
  CreateBlogHandler,
  UpdateBlogHandler,
  DeleteBlogHandler,
];

const PostCommandHandlers = [
  CreatePostHandler,
  UpdatePostHandler,
  DeletePostHandler,
  ChangeLikeForPostHandler,
];

const CommentCommandHandlers = [
  CreateCommentHandler,
  UpdateCommentHandler,
  DeleteCommentHandler,
  ChangeLikeForCommentHandler,
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
  controllers: [
    BlogsController,
    SABlogsController,
    PostsController,
    SAPostsController,
    CommentsController,
  ],
  providers: [
    BlogsService,
    {
      provide: BLOGS_REPOSITORY,
      useClass: BlogsRepositoryPSQL,
    },
    {
      provide: BLOGS_QUERY_REPO,
      useClass: BlogsQueryRepoPSQL,
    },
    PostsService,
    {
      provide: POSTS_REPOSITORY,
      useClass: PostsRepositoryPSQL,
    },
    {
      provide: POSTS_QUERY_REPO,
      useClass: PostsQueryRepoPSQL,
    },
    CommentsService,
    {
      provide: COMMENTS_REPOSITORY,
      useClass: CommentsRepositoryPSQL,
    },
    {
      provide: COMMENTS_QUERY_REPO,
      useClass: CommentsQueryRepoPSQL,
    },
    {
      provide: LIKES_REPOSITORY,
      useClass: LikesRepositoryPSQL,
    },
    ...BlogCommandHandlers,
    ...PostCommandHandlers,
    ...CommentCommandHandlers,
  ],
  exports: [
    BLOGS_REPOSITORY,
    POSTS_REPOSITORY,
    COMMENTS_REPOSITORY,
    LIKES_REPOSITORY,
  ],
})
export class BloggerPlatformModule {}
