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
} from '@nestjs/common';
import { PostsQueryRepo } from './posts.queryRepository';
import { PostInputModel, PostViewModel } from './posts.models';
import { Paginated, Paginator } from '../../../Models/paginator.models';
import {
  CommentInputModel,
  CommentViewModel,
} from '../comments/comments.models';
import { CommentsQueryRepo } from '../comments/comments.queryRepo';
import { PostsRepository } from './posts.repository';
import { InputID } from '../../../Models/IDmodel';
import { CreatePostCommand } from './Service/use-cases/create-post.command';
import { CommandBus } from '@nestjs/cqrs';
import { DeletePostCommand } from './Service/use-cases/delete-post.command';
import { UpdatePostCommand } from './Service/use-cases/update-post.command';
import { CreateCommentCommand } from '../comments/Service/use-cases/create-comment.command';
import { ChangeLikeForPostCommand } from './Service/use-cases/change-like-for-post.command';
import { LikeInputModel } from '../likes/likes.models';
import { AdminAuthGuard } from '../../../Request-Modifications/Guards/basicAuth.guard';
import { UserAuthGuard } from '../../../Request-Modifications/Guards/accessToken.guard';
import { OptionalAccessTokenGuardGuard } from '../../../Request-Modifications/Guards/optionalAccessToken.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private repository: PostsRepository,
    private queryRepo: PostsQueryRepo,
    private commentsQueryRepo: CommentsQueryRepo,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(OptionalAccessTokenGuardGuard)
  @HttpCode(200)
  async getPosts(@Query() query: Paginator): Promise<Paginated<PostViewModel>> {
    const result: Paginated<PostViewModel> =
      await this.queryRepo.findWithSearchAndPagination('', query);
    if (!result) {
      throw new Error();
    }
    return result;
  }

  @Get(':id')
  @UseGuards(OptionalAccessTokenGuardGuard)
  @HttpCode(200)
  async getPostById(@Param() { id }: InputID): Promise<PostViewModel> {
    const result: PostViewModel | null = await this.queryRepo.findById(id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Get(':id/comments')
  @UseGuards(OptionalAccessTokenGuardGuard)
  @HttpCode(200)
  async getCommentsUnderPost(
    @Param() { id }: InputID,
    @Query() query: Paginator,
  ): Promise<Paginated<CommentViewModel>> {
    if (!(await this.repository.findById(id))) {
      throw new NotFoundException();
    }
    return await this.commentsQueryRepo.findWithSearchAndPagination(id, query);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @HttpCode(201)
  async postPost(@Body() post: PostInputModel): Promise<PostViewModel> {
    const result: PostViewModel | null = await this.commandBus.execute(
      new CreatePostCommand(post),
    );
    if (!result) {
      throw new Error();
    }
    return result;
  }

  @Post(':id/comments')
  @UseGuards(AdminAuthGuard)
  @HttpCode(200)
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

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(204)
  async putPost(
    @Param() { id }: InputID,
    @Body() post: PostInputModel,
  ): Promise<void> {
    const result: boolean = await this.commandBus.execute(
      new UpdatePostCommand(id, post),
    );
    if (!result) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(204)
  async deletePost(@Param() { id }: InputID): Promise<void> {
    const result: boolean = await this.commandBus.execute(
      new DeletePostCommand(id),
    );
    if (!result) {
      throw new NotFoundException();
    }
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
  }
}
