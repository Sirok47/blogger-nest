import { NestExpressApplication } from '@nestjs/platform-express';
import http from 'http';
import { BlogsRepositoryPSQL } from '../src/Modules/BloggerPlatform/blogs/Repository/PostgreSQL/blogs.repository.psql';
import { PostsRepositoryPSQL } from '../src/Modules/BloggerPlatform/posts/Repository/PostgreSQL/posts.repository.psql';
import { initTestingModule, startTestServer } from './helpers/app-start';
import { getSomeExistingBlogId, populateDBWithSomeBlogs } from './helpers/blog-helpers';
import request from "supertest";
import { addToDBSomeUser } from './helpers/user-helpers';
import { UsersRepositoryPSQL } from '../src/Modules/AuthModule/users/Repository/PostgreSQL/users.repository.psql';
import { config } from '../src/Settings/config';
import { QuestionPSQL } from '../src/Modules/quiz-game/entities/question.entity';
import { QuestionInputModel } from '../src/Modules/quiz-game/DTOs/question.dto';
import { QuestionRepository } from '../src/Modules/quiz-game/Repository/question.repository';

function questionGenerator(count: number): QuestionInputModel[] {
  const result: QuestionInputModel[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      body: 'body' + i,
      correctAnswers: ['answer' + i],
    });
  }
  return result;
}

describe('Testing CRUD for posts',()=>{
  let app: NestExpressApplication;
  let server: http.Server;
  let existingBlogId: string;
  let blogsRepo: BlogsRepositoryPSQL
  let postsRepo: PostsRepositoryPSQL
  let usersRepo: UsersRepositoryPSQL
  let questionRepo: QuestionRepository

  beforeAll(async ()=>{
    const moduleRef = await initTestingModule([]);

    blogsRepo = moduleRef.get(BlogsRepositoryPSQL);
    postsRepo = moduleRef.get(PostsRepositoryPSQL);
    usersRepo = moduleRef.get(UsersRepositoryPSQL);
    questionRepo = moduleRef.get(QuestionRepository);

    ({app,server} = await startTestServer(moduleRef))

    await blogsRepo.deleteAll()
    await postsRepo.deleteAll()
    await populateDBWithSomeBlogs(blogsRepo,2)
    existingBlogId = await getSomeExistingBlogId(blogsRepo)
  })

  afterAll(async () => {
    await app.close();
  })

  it('controller quiz game', async ()=>{
    const user1 = await  addToDBSomeUser(usersRepo, 'login1')
    const user2 = await  addToDBSomeUser(usersRepo, 'login2')
    const user3 = await  addToDBSomeUser(usersRepo, 'login3')
    const user1token = await request(server)
      .post('auth/login')
      .send({
        loginOrEmail: user1.login,
        password: user1.password,
      })
    const user2token = await request(server)
      .post('auth/login')
      .send({
        loginOrEmail: user2.login,
        password: user2.password,
      })
    const user3token = await request(server)
      .post('auth/login')
      .send({
        loginOrEmail: user3.login,
        password: user3.password,
      })

    const promises: Promise<any>[] = [];
    for (const question of questionGenerator(config.QUIZ_GAME_QUESTION_COUNT)) {
      const qEntity = new QuestionPSQL(question.body, question.correctAnswers);
      promises.push(questionRepo.save(qEntity));
    }
    await Promise.all(promises);

    await request(server)
      .post('pair-game-quiz/pairs/connection')
      .auth(user1token.body.accessToken, { type: "bearer" })

    await request(server)
      .post('pair-game-quiz/pairs/connection')
      .auth(user2token.body.accessToken, { type: "bearer" })

    await request(server)
      .post('pair-game-quiz/pairs/connection')
      .auth(user3token.body.accessToken, { type: "bearer" })
  })




})