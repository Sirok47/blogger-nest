import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { BlogsRepository } from './Modules/BloggerPlatform/blogs/blogs.repository';
import { PostsRepository } from './Modules/BloggerPlatform/posts/posts.repository';
import { UsersRepository } from './Modules/AuthModule/users/users.repository';
import { CommentsRepository } from './Modules/BloggerPlatform/comments/comments.repository';
import { SessionRepository } from './Modules/AuthModule/auth/sessions.repository';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
    //private likesRepository: LikesRepository,
    private sessionsRepository: SessionRepository,
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
      //this.likesRepository.deleteAll(),
      this.sessionsRepository.deleteAll(),
    ]);
  }
}
