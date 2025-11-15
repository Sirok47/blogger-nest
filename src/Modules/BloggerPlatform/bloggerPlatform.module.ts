import { Module } from '@nestjs/common';
import { BlogsController, SABlogsController } from './blogs/blogs.controller';
import {
  BLOGS_QUERY_REPO,
  BLOGS_REPOSITORY,
  BlogsService,
} from './blogs/Service/blogs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogMongo, BlogPSQL, BlogSchema } from './blogs/blogs.models';
import {
  POSTS_QUERY_REPO,
  POSTS_REPOSITORY,
  PostsService,
} from './posts/Service/posts.service';
import { PostsController, SAPostsController } from './posts/posts.controller';
import { PostMongo, PostPSQL, PostSchema } from './posts/posts.models';
import { CommentsController } from './comments/comments.controller';
import {
  COMMENTS_QUERY_REPO,
  COMMENTS_REPOSITORY,
  CommentsService,
} from './comments/Service/comments.service';
import {
  CommentMongo,
  CommentPSQL,
  CommentSchema,
} from './comments/comments.models';
import { CreateBlogHandler } from './blogs/Service/use-cases/create-blog.command';
import { UpdateBlogHandler } from './blogs/Service/use-cases/update-blog.command';
import { DeleteBlogHandler } from './blogs/Service/use-cases/delete-blog.command';
import { CreatePostHandler } from './posts/Service/use-cases/create-post.command';
import { UpdatePostHandler } from './posts/Service/use-cases/update-post.command';
import { DeletePostHandler } from './posts/Service/use-cases/delete-post.command';
import {
  LikeMongo,
  LikePSQL,
  LIKES_REPOSITORY,
  LikeSchema,
} from './likes/likes.models';
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
import { LikesRepositoryPSQL } from './likes/Repository/likes.repository.psql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsRepositoryRawPSQL } from './blogs/Repository/RawSQL/blogs.repository.rawpsql';
import { BlogsRepository } from './blogs/Repository/MongoDB/blogs.repository';
import { BlogsQueryRepo } from './blogs/Repository/MongoDB/blogs.queryRepo';
import { BlogsQueryRepoRawPSQL } from './blogs/Repository/RawSQL/blogs.queryRepo.rawpsql';
import { CommentsRepository } from './comments/Repository/MongoDB/comments.repository';
import { CommentsRepositoryRawPSQL } from './comments/Repository/RawSQL/comments.repository.rawpsql';
import { PostsRepository } from './posts/Repository/MongoDB/posts.repository';
import { PostsRepositoryRawPSQL } from './posts/Repository/RawSQL/posts.repository.rawpsql';
import { PostsQueryRepo } from './posts/Repository/MongoDB/posts.queryRepo';
import { PostsQueryRepoRawPSQL } from './posts/Repository/RawSQL/posts.queryRepo.rawpsql';
import { CommentsQueryRepo } from './comments/Repository/MongoDB/comments.queryRepo';
import { CommentsQueryRepoRawPSQL } from './comments/Repository/RawSQL/comments.queryRepo.rawpsql';
import { LikesRepository } from './likes/Repository/likes.repository';
import { LikesRepositoryRawPSQL } from './likes/Repository/likes.repository.rawpsql';

const BlogCommandHandlers = [
  CreateBlogHandler,
  UpdateBlogHandler,
  DeleteBlogHandler,
];
const BlogRepos = [
  BlogsRepository,
  BlogsRepositoryPSQL,
  BlogsRepositoryRawPSQL,
];
const BlogQueryRepos = [
  BlogsQueryRepo,
  BlogsQueryRepoPSQL,
  BlogsQueryRepoRawPSQL,
];

const PostCommandHandlers = [
  CreatePostHandler,
  UpdatePostHandler,
  DeletePostHandler,
  ChangeLikeForPostHandler,
];
const PostRepos = [
  PostsRepository,
  PostsRepositoryPSQL,
  PostsRepositoryRawPSQL,
];
const PostQueryRepos = [
  PostsQueryRepo,
  PostsQueryRepoPSQL,
  PostsQueryRepoRawPSQL,
];

const CommentCommandHandlers = [
  CreateCommentHandler,
  UpdateCommentHandler,
  DeleteCommentHandler,
  ChangeLikeForCommentHandler,
];
const CommentRepos = [
  CommentsRepository,
  CommentsRepositoryPSQL,
  CommentsRepositoryRawPSQL,
];
const CommentQueryRepos = [
  CommentsQueryRepo,
  CommentsQueryRepoPSQL,
  CommentsQueryRepoRawPSQL,
];

const LikeRepos = [
  LikesRepository,
  LikesRepositoryPSQL,
  LikesRepositoryRawPSQL,
];

@Module({
  imports: [
    AuthModule,
    TokenModule,
    MongooseModule.forFeature([
      { name: BlogMongo.name, schema: BlogSchema },
      { name: PostMongo.name, schema: PostSchema },
      { name: CommentMongo.name, schema: CommentSchema },
      { name: LikeMongo.name, schema: LikeSchema },
    ]),
    TypeOrmModule.forFeature([BlogPSQL, PostPSQL, CommentPSQL, LikePSQL]),
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
    ...BlogRepos,
    ...BlogQueryRepos,
    {
      provide: BLOGS_REPOSITORY,
      useClass: BlogsRepositoryPSQL,
    },
    {
      provide: BLOGS_QUERY_REPO,
      useClass: BlogsQueryRepoPSQL,
    },
    PostsService,
    ...PostRepos,
    ...PostQueryRepos,
    {
      provide: POSTS_REPOSITORY,
      useClass: PostsRepositoryPSQL,
    },
    {
      provide: POSTS_QUERY_REPO,
      useClass: PostsQueryRepoPSQL,
    },
    CommentsService,
    ...CommentRepos,
    ...CommentQueryRepos,
    {
      provide: COMMENTS_REPOSITORY,
      useClass: CommentsRepositoryPSQL,
    },
    {
      provide: COMMENTS_QUERY_REPO,
      useClass: CommentsQueryRepoPSQL,
    },
    ...LikeRepos,
    {
      provide: LIKES_REPOSITORY,
      useClass: LikesRepositoryPSQL,
    },
    ...BlogCommandHandlers,
    ...PostCommandHandlers,
    ...CommentCommandHandlers,
  ],
  exports: [
    TypeOrmModule,
    BLOGS_REPOSITORY,
    POSTS_REPOSITORY,
    COMMENTS_REPOSITORY,
    LIKES_REPOSITORY,
  ],
})
export class BloggerPlatformModule {}
