import { Controller, Delete, Get, HttpCode, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from './Modules/AuthModule/users/Service/users.service';
import {
  type ISessionsRepository,
  SESSIONS_REPOSITORY,
} from './Modules/AuthModule/auth/Service/auth.service';
import {
  BLOGS_REPOSITORY,
  type IBlogsRepository,
} from './Modules/BloggerPlatform/blogs/Service/blogs.service';
import {
  type IPostsRepository,
  POSTS_REPOSITORY,
} from './Modules/BloggerPlatform/posts/Service/posts.service';
import {
  type ILikesRepository,
  LIKES_REPOSITORY,
} from './Modules/BloggerPlatform/likes/likes.models';
import {
  COMMENTS_REPOSITORY,
  type ICommentsRepository,
} from './Modules/BloggerPlatform/comments/Service/comments.service';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    @Inject(BLOGS_REPOSITORY)
    private blogsRepository: IBlogsRepository,
    @Inject(POSTS_REPOSITORY)
    private postsRepository: IPostsRepository,
    @Inject(USERS_REPOSITORY)
    private usersRepository: IUsersRepository,
    @Inject(COMMENTS_REPOSITORY)
    private commentsRepository: ICommentsRepository,
    @Inject(LIKES_REPOSITORY)
    private likesRepository: ILikesRepository,
    @Inject(SESSIONS_REPOSITORY)
    private sessionsRepository: ISessionsRepository,
  ) {}

  @Get()
  @HttpCode(200)
  getHello(): string {
    return this.appService.getHello();
  }

  @Delete('testing/all-data')
  @HttpCode(204)
  async deleteAll(): Promise<void> {
    await Promise.all([
      this.likesRepository.deleteAll(),
      this.sessionsRepository.deleteAll(),
    ]);
    await Promise.all([
      this.usersRepository.deleteAll(),
      this.commentsRepository.deleteAll(),
    ]);
    await this.blogsRepository.deleteAll();
    await this.postsRepository.deleteAll();
  }
}
