import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './Service/blogs.service';
import { BlogsQueryRepo } from './blogs.queryRepo';
import { BlogDocument, BlogInputModel, BlogViewModel } from './blogs.models';
import { Paginated, Paginator } from '../../../Models/paginator.models';
import { BlogsRepository } from './blogs.repository';
import { PostUnderBlogInputModel, PostViewModel } from '../posts/posts.models';
import { PostsQueryRepo } from '../posts/posts.queryRepository';
import { InputID } from '../../../Models/IDmodel';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../posts/Service/use-cases/create-post.command';
import { DeleteBlogCommand } from './Service/use-cases/delete-blog.command';
import { CreateBlogCommand } from './Service/use-cases/create-blog.command';
import { UpdateBlogCommand } from './Service/use-cases/update-blog.command';
import { AdminAuthGuard } from '../../../Request-Modifications/Guards/basicAuth.guard';
import { OptionalAccessTokenGuardGuard } from '../../../Request-Modifications/Guards/optionalAccessToken.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected service: BlogsService,
    protected queryRepo: BlogsQueryRepo,
    protected postsQueryRepo: PostsQueryRepo,
    protected repo: BlogsRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @HttpCode(200)
  async getBlogs(@Query() query: Paginator): Promise<Paginated<BlogViewModel>> {
    return await this.queryRepo.findWithSearchAndPagination(query);
  }

  @Get(':id')
  @HttpCode(200)
  async getBlogById(@Param() { id }: InputID): Promise<BlogViewModel> {
    const result: BlogDocument | null = await this.queryRepo.findById(id);
    if (!result) {
      throw new NotFoundException();
    }
    return result.mapToViewModel();
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @HttpCode(201)
  async postBlog(@Body() blog: BlogInputModel): Promise<BlogViewModel> {
    return await this.commandBus.execute(new CreateBlogCommand(blog));
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(204)
  async putBlog(
    @Param() { id }: InputID,
    @Body() blog: BlogInputModel,
  ): Promise<void> {
    const result: boolean = await this.commandBus.execute(
      new UpdateBlogCommand(id, blog),
    );
    if (!result) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param() { id }: InputID): Promise<void> {
    const result: boolean = await this.commandBus.execute(
      new DeleteBlogCommand(id),
    );
    if (!result) {
      throw new NotFoundException();
    }
  }

  @Get(':id/posts')
  @UseGuards(OptionalAccessTokenGuardGuard)
  @HttpCode(200)
  async getPostsInBlog(
    @Param() { id }: InputID,
    @Query() query: Paginator,
    @Param('userId') userId: string,
  ): Promise<Paginated<PostViewModel>> {
    const blog: BlogDocument | null = await this.repo.findById(id);
    if (!blog) {
      throw new NotFoundException();
    }
    return await this.postsQueryRepo.findWithSearchAndPagination(
      blog._id.toString(),
      query,
      userId ?? '',
    );
  }

  @Post(':id/posts')
  @UseGuards(AdminAuthGuard)
  @HttpCode(201)
  async postPostIntoBlog(
    @Param() { id }: InputID,
    @Body() post: PostUnderBlogInputModel,
  ): Promise<PostViewModel> {
    post.blogId = id;
    const result: PostViewModel | null = await this.commandBus.execute(
      new CreatePostCommand(post),
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
}
