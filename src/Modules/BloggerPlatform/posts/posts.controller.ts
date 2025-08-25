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
} from '@nestjs/common';
import { PostsQueryRepo } from './posts.queryRepository';
import { PostsService } from './posts.service';
import {
  PostDocument,
  type PostInputModel,
  PostViewModel,
} from './posts.models';
import { Paginated, Paginator } from '../../../Models/paginator.models';
import { CommentViewModel } from '../comments/comments.models';
import { CommentsQueryRepo } from '../comments/comments.queryRepo';
import { PostsRepository } from './posts.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private service: PostsService,
    private repository: PostsRepository,
    private queryRepo: PostsQueryRepo,
    private commentsQueryRepo: CommentsQueryRepo,
  ) {}

  @Get()
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
  @HttpCode(200)
  async getPostById(@Param('id') id: string): Promise<PostViewModel> {
    const result: PostDocument | null = await this.queryRepo.findById(id);
    if (!result) {
      throw new NotFoundException();
    }
    return result.mapToViewModel();
  }

  @Get(':id/comments')
  @HttpCode(200)
  async getCommentsUnderPost(
    @Param('id') id: string,
    @Query() query: Paginator,
  ): Promise<Paginated<CommentViewModel>> {
    if (!(await this.repository.findById(id))) {
      throw new NotFoundException();
    }
    return await this.commentsQueryRepo.findWithSearchAndPagination(id, query);
  }

  @Post()
  @HttpCode(201)
  async postPost(@Body() post: PostInputModel): Promise<PostViewModel> {
    const result: PostViewModel | null = await this.service.postOnePost(post);
    if (!result) {
      throw new Error();
    }
    return result;
  }

  @Put(':id')
  @HttpCode(204)
  async putPost(
    @Param('id') id: string,
    @Body() post: PostInputModel,
  ): Promise<void> {
    const result = await this.service.putOnePost(id, post);
    if (!result) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string): Promise<void> {
    const result = await this.service.deleteOnePost(id);
    if (!result) {
      throw new NotFoundException();
    }
  }

  /*async setLikeStatus(req: Request, res: Response) {
    const result = await this.service.changeLikeStatus(
      req.params.id,
      req.params.token,
      req.body.likeStatus,
    );
    if (!result) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  }*/
}
