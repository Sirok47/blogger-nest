import { Controller, Delete, Get, HttpCode, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { BlogsRepository } from './Modules/BloggerPlatform/blogs/blogs.repository';
import { PostsRepository } from './Modules/BloggerPlatform/posts/posts.repository';
import { CommentsRepository } from './Modules/BloggerPlatform/comments/comments.repository';
import { LikesRepository } from './Modules/BloggerPlatform/likes/likes.repository';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from './Modules/AuthModule/users/Service/users.service';
import {
  type ISessionsRepository,
  SESSIONS_REPOSITORY,
} from './Modules/AuthModule/auth/Service/auth.service';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    @Inject(USERS_REPOSITORY)
    private usersRepository: IUsersRepository,
    private commentsRepository: CommentsRepository,
    private likesRepository: LikesRepository,
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
      this.blogsRepository.deleteAll(),
      this.postsRepository.deleteAll(),
      this.usersRepository.deleteAll(),
      this.commentsRepository.deleteAll(),
      this.likesRepository.deleteAll(),
      this.sessionsRepository.deleteAll(),
    ]);
  }
}
