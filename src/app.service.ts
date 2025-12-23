import { Inject, Injectable } from '@nestjs/common';
import {
  BLOGS_REPOSITORY,
  type IBlogsRepository,
} from './Modules/BloggerPlatform/blogs/Service/blogs.service';
import {
  type IPostsRepository,
  POSTS_REPOSITORY,
} from './Modules/BloggerPlatform/posts/Service/posts.service';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from './Modules/AuthModule/users/Service/users.service';
import {
  COMMENTS_REPOSITORY,
  type ICommentsRepository,
} from './Modules/BloggerPlatform/comments/Service/comments.service';
import {
  type ILikesRepository,
  LIKES_REPOSITORY,
} from './Modules/BloggerPlatform/likes/likes.entity';
import {
  type ISessionsRepository,
  SESSIONS_REPOSITORY,
} from './Modules/AuthModule/auth/Service/auth.service';
import { GameRepository } from './Modules/quiz-game/Repository/game.repository';
import { QuestionRepository } from './Modules/quiz-game/Repository/question.repository';
import { PlayerRepository } from './Modules/quiz-game/Repository/player.repository';
import { AnswerRepository } from './Modules/quiz-game/Repository/answer.repository';

@Injectable()
export class AppService {
  constructor(
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
    private gameRepository: GameRepository,
    private playerRepository: PlayerRepository,
    private questionRepository: QuestionRepository,
    private answerRepository: AnswerRepository,
  ) {}
  getHello(): string {
    return 'Gnezdo stoit';
  }

  async deleteAll(): Promise<void> {
    const quizPromise = Promise.all([
      this.answerRepository.deleteAll(),
      this.questionRepository.deleteAll(),
      this.gameRepository.deleteAll(),
      this.playerRepository.deleteAll(),
    ]);
    await Promise.all([
      this.likesRepository.deleteAll(),
      this.sessionsRepository.deleteAll(),
      this.commentsRepository.deleteAll(),
    ]);
    await this.postsRepository.deleteAll();
    await Promise.all([
      this.usersRepository.deleteAll(),
      this.blogsRepository.deleteAll(),
    ]);
    await quizPromise;
  }
}
