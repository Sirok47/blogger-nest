import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  BLOGS_QUERY_REPO,
  BLOGS_REPOSITORY,
  BlogsService,
  type IBlogsQueryRepo,
  type IBlogsRepository,
} from './Service/blogs.service';
import { Blog, BlogInputModel, BlogViewModel } from './blogs.entity';
import { Paginated, Paginator } from '../../../Models/paginator.models';
import { PostViewModel } from '../posts/posts.entity';
import { InputID } from '../../../Models/IDmodel';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteBlogCommand } from './Service/use-cases/delete-blog.command';
import { CreateBlogCommand } from './Service/use-cases/create-blog.command';
import { UpdateBlogCommand } from './Service/use-cases/update-blog.command';
import { AdminAuthGuard } from '../../../Request-Modifications/Guards/basicAuth.guard';
import { OptionalAccessTokenGuardGuard } from '../../../Request-Modifications/Guards/optionalAccessToken.guard';
import {
  type IPostsQueryRepo,
  POSTS_QUERY_REPO,
} from '../posts/Service/posts.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected service: BlogsService,
    @Inject(BLOGS_QUERY_REPO)
    protected queryRepo: IBlogsQueryRepo,
    @Inject(POSTS_QUERY_REPO)
    protected postsQueryRepo: IPostsQueryRepo,
    @Inject(BLOGS_REPOSITORY)
    protected repo: IBlogsRepository,
  ) {}

  @Get()
  @HttpCode(200)
  async getBlogs(@Query() query: Paginator): Promise<Paginated<BlogViewModel>> {
    return await this.queryRepo.findWithSearchAndPagination(query);
  }

  @Get(':id')
  @HttpCode(200)
  async getBlogById(@Param() { id }: InputID): Promise<BlogViewModel> {
    const result: BlogViewModel | null = await this.queryRepo.findById(id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Get(':id/posts')
  @UseGuards(OptionalAccessTokenGuardGuard)
  @HttpCode(200)
  async getPostsInBlog(
    @Param() { id }: InputID,
    @Query() query: Paginator,
    @Param('userId') userId: string,
  ): Promise<Paginated<PostViewModel>> {
    const blog: Blog | null = await this.repo.findById(id);
    if (!blog) {
      throw new NotFoundException();
    }
    return await this.postsQueryRepo.findWithSearchAndPagination(
      blog.id,
      query,
      userId ?? '',
    );
  }

  /*@Post(':id/posts')
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
  }*/
}

@Controller('sa/blogs')
@UseGuards(AdminAuthGuard)
export class SABlogsController {
  constructor(
    protected service: BlogsService,
    @Inject(BLOGS_QUERY_REPO)
    protected queryRepo: IBlogsQueryRepo,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @HttpCode(200)
  async getBlogs(@Query() query: Paginator): Promise<Paginated<BlogViewModel>> {
    return await this.queryRepo.findWithSearchAndPagination(query);
  }

  @Post()
  @HttpCode(201)
  async postBlog(@Body() blog: BlogInputModel): Promise<BlogViewModel> {
    return await this.commandBus.execute(new CreateBlogCommand(blog));
  }

  @Put(':id')
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
  @HttpCode(204)
  async deleteBlog(@Param() { id }: InputID): Promise<void> {
    const result: boolean = await this.commandBus.execute(
      new DeleteBlogCommand(id),
    );
    if (!result) {
      throw new NotFoundException();
    }
  }
}
