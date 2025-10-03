import {
  Get,
  NotFoundException,
  Param,
  Query,
  Post,
  Body,
  Put,
  Delete,
  HttpCode,
  Controller,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  PostInputModel,
  PostUnderBlogInputModel,
  PostViewModel,
} from './posts.models';
import { Paginated, Paginator } from '../../../Models/paginator.models';
import {
  CommentInputModel,
  CommentViewModel,
} from '../comments/comments.models';
import { CommentsQueryRepo } from '../comments/comments.queryRepo';
import { InputBlogID, InputID } from '../../../Models/IDmodel';
import { CreatePostCommand } from './Service/use-cases/create-post.command';
import { CommandBus } from '@nestjs/cqrs';
import { DeletePostCommand } from './Service/use-cases/delete-post.command';
import {
  type IPostsQueryRepo,
  type IPostsRepository,
  POSTS_QUERY_REPO,
  POSTS_REPOSITORY,
} from './Service/posts.service';
import { UpdatePostCommand } from './Service/use-cases/update-post.command';
import { CreateCommentCommand } from '../comments/Service/use-cases/create-comment.command';
import { ChangeLikeForPostCommand } from './Service/use-cases/change-like-for-post.command';
import { LikeInputModel } from '../likes/likes.models';
import { AdminAuthGuard } from '../../../Request-Modifications/Guards/basicAuth.guard';
import { UserAuthGuard } from '../../../Request-Modifications/Guards/accessToken.guard';
import { OptionalAccessTokenGuardGuard } from '../../../Request-Modifications/Guards/optionalAccessToken.guard';
import {
  BLOGS_REPOSITORY,
  type IBlogsRepository,
} from '../blogs/Service/blogs.service';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(POSTS_REPOSITORY)
    private repository: IPostsRepository,
    @Inject(POSTS_QUERY_REPO)
    private queryRepo: IPostsQueryRepo,
    private commentsQueryRepo: CommentsQueryRepo,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(OptionalAccessTokenGuardGuard)
  @HttpCode(200)
  async getPosts(
    @Query() query: Paginator,
    @Param('userId') userId: string,
  ): Promise<Paginated<PostViewModel>> {
    const result: Paginated<PostViewModel> =
      await this.queryRepo.findWithSearchAndPagination('', query, userId ?? '');
    if (!result) {
      throw new Error();
    }
    return result;
  }

  @Get(':id')
  @UseGuards(OptionalAccessTokenGuardGuard)
  @HttpCode(200)
  async getPostById(
    @Param() { id }: InputID,
    @Param('userId') userId: string,
  ): Promise<PostViewModel> {
    const result: PostViewModel | null = await this.queryRepo.findById(
      id,
      userId,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  /*  @Get(':id/comments')
  @UseGuards(OptionalAccessTokenGuardGuard)
  @HttpCode(200)
  async getCommentsUnderPost(
    @Param() { id }: InputID,
    @Query() query: Paginator,
    @Param('userId') userId: string,
  ): Promise<Paginated<CommentViewModel>> {
    if (!(await this.repository.findById(id))) {
      throw new NotFoundException();
    }
    return await this.commentsQueryRepo.findWithSearchAndPagination(
      id,
      query,
      userId ?? '',
    );
  }

  @Post(':id/comments')
  @UseGuards(UserAuthGuard)
  @HttpCode(201)
  async postCommentUnderPost(
    @Param() { id }: InputID,
    @Body() newComment: CommentInputModel,
    @Param('token') token: string,
  ): Promise<CommentViewModel> {
    const result: CommentViewModel | null = await this.commandBus.execute(
      new CreateCommentCommand(id, newComment, token),
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Put(':id/like-status')
  @UseGuards(UserAuthGuard)
  @HttpCode(204)
  async setLikeStatus(
    @Param() { id }: InputID,
    @Body() { likeStatus }: LikeInputModel,
    @Param('token') token: string,
  ): Promise<void> {
    const result: boolean = await this.commandBus.execute(
      new ChangeLikeForPostCommand(id, likeStatus, token),
    );
    if (!result) {
      throw new NotFoundException();
    }
  }*/
}

@Controller('sa/blogs/:blogId/posts')
@UseGuards(AdminAuthGuard)
export class SAPostsController {
  constructor(
    @Inject(BLOGS_REPOSITORY)
    private blogsRepo: IBlogsRepository,
    @Inject(POSTS_QUERY_REPO)
    private queryRepo: IPostsQueryRepo,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @HttpCode(200)
  async getPosts(
    @Query() query: Paginator,
    @Param('blogId') blogId: string,
  ): Promise<Paginated<PostViewModel>> {
    const result: Paginated<PostViewModel> =
      await this.queryRepo.findWithSearchAndPagination(blogId, query, '');
    if (!result) {
      throw new Error();
    }
    return result;
  }

  @Post()
  @HttpCode(201)
  async postPostIntoBlog(
    @Param() { blogId }: InputBlogID,
    @Body() post: PostUnderBlogInputModel,
  ): Promise<PostViewModel> {
    if (!(await this.blogsRepo.findById(blogId))) {
      throw new NotFoundException();
    }
    post.blogId = blogId;
    const result: PostViewModel | null = await this.commandBus.execute(
      new CreatePostCommand(post),
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Put(':id')
  @HttpCode(204)
  async putPost(
    @Param() { id }: InputID,
    @Param() { blogId }: InputBlogID,
    @Body() post: PostUnderBlogInputModel,
  ): Promise<void> {
    if (!(await this.blogsRepo.findById(blogId))) {
      throw new NotFoundException();
    }
    const result: boolean = await this.commandBus.execute(
      new UpdatePostCommand(id, post),
    );
    if (!result) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param() { id }: InputID): Promise<void> {
    const result: boolean = await this.commandBus.execute(
      new DeletePostCommand(id),
    );
    if (!result) {
      throw new NotFoundException();
    }
  }
}
