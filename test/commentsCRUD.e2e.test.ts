import http from "http";
import request from "supertest";
import {getSomeExistingBlogId, populateDBWithSomeBlogs} from "./helpers/blog-helpers";
import { initTestingModule, startTestServer } from './helpers/app-start';
import { BloggerPlatformModule } from '../src/Modules/BloggerPlatform/bloggerPlatform.module';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../src/Modules/AuthModule/auth.module';
import { BlogsRepositoryPSQL } from '../src/Modules/BloggerPlatform/blogs/Repository/PostgreSQL/blogs.repository.psql';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PostsRepositoryPSQL } from "src/Modules/BloggerPlatform/posts/Repository/PostgreSQL/posts.repository.psql";
import {
  CommentsRepositoryPSQL
} from '../src/Modules/BloggerPlatform/comments/Repository/PostgreSQL/comments.repository.psql';
import { AuthService } from '../src/Modules/AuthModule/auth/Service/auth.service';
import { getSomeExistingPostId, populateDBWithSomePosts } from './helpers/post-helpers';
import { addToDBSomeUser, getSomeExistingUserId } from './helpers/user-helpers';
import { CommentInputModel } from '../src/Modules/BloggerPlatform/comments/comments.entity';
import {
  createSomeCommentInputObject,
  getSomeExistingCommentId,
  populateDBWithSomeComments,
} from './helpers/comment-helpers';
import { UsersRepositoryPSQL } from '../src/Modules/AuthModule/users/Repository/PostgreSQL/users.repository.psql';

describe('Testing CRUD for comments',()=>{
  let app: NestExpressApplication;
  let server: http.Server
  let existingBlogId: string
  let existingPostId: string
  let existingUserId: string
  let accessToken: string
  let user: {login: string, password: string}
  let blogsRepo: BlogsRepositoryPSQL;
  let postsRepo: PostsRepositoryPSQL;
  let authService: AuthService
  let commentsRepo: CommentsRepositoryPSQL;
  let usersRepo: UsersRepositoryPSQL;

  beforeAll(async () => {
    const moduleRef = await initTestingModule([
      BloggerPlatformModule,
      CqrsModule.forRoot(),
      AuthModule,
    ]);

    blogsRepo = moduleRef.get(BlogsRepositoryPSQL);
    postsRepo = moduleRef.get(PostsRepositoryPSQL)
    authService = moduleRef.get(AuthService);
    commentsRepo = moduleRef.get(CommentsRepositoryPSQL);
    usersRepo = moduleRef.get(UsersRepositoryPSQL);

    ({app,server} = await startTestServer(moduleRef))

    await blogsRepo.deleteAll()
    await postsRepo.deleteAll()
    await commentsRepo.deleteAll()
    await populateDBWithSomeBlogs(blogsRepo,2)
    existingBlogId = await getSomeExistingBlogId(blogsRepo)
    await populateDBWithSomePosts(postsRepo, blogsRepo, 2,existingBlogId)
    existingPostId = await getSomeExistingPostId(postsRepo)
    user = await addToDBSomeUser(usersRepo)
    existingUserId = await getSomeExistingUserId(usersRepo)
  });

  afterAll(async () => {
    await app.close();
  });


    beforeEach(async ()=>{
        accessToken = authService.createNewSession(user.login, 'asd', {IP:'something',userAgent:'someshit'})!.accessToken
    })

    afterEach(async ()=>{
        await commentsRepo.deleteAll()
    })

    it('should return status 201 and {comment}', async () => {
        const commentToSend: CommentInputModel = createSomeCommentInputObject()
        await request(server)
            .post(`/posts/${existingPostId}/comments`)
            .auth(accessToken, { type: "bearer" })
            .send(commentToSend)
            .expect(201)
            .then(response => {
                expect(response.body.content).toEqual(commentToSend.content)
            })
    });

    it('should return [{comment}]', async () => {
        await populateDBWithSomeComments(commentsRepo,usersRepo,5, existingUserId, existingPostId)
        await request(server)
            .get(`/posts/${existingPostId}/comments?pageSize=3`)
            .expect(200)
            .then(response => {
                expect(response.body.pagesCount).toEqual(2);
                expect(response.body.page).toEqual(1);
                expect(response.body.pageSize).toEqual(3);
                expect(response.body.totalCount).toEqual(5);
                expect(response.body.items).toHaveLength(3);
            })
    });

    it('should return 1 exact {comment}', async () => {
        await populateDBWithSomeComments(commentsRepo,usersRepo,2,existingUserId, existingPostId)
        const commentId: string = await getSomeExistingCommentId(commentsRepo)
        await request(server)
            .get('/comments/'+commentId)
            .expect(200)
            .then(response => {
                expect(response.body.id).toEqual(commentId);
            })
    });

    it('should return 204 and update {comment}', async () => {
        await populateDBWithSomeComments(commentsRepo,usersRepo,2,existingUserId, existingPostId)
        const commentId: string = await getSomeExistingCommentId(commentsRepo)
        const newComment: CommentInputModel = createSomeCommentInputObject()
        await request(server)
            .put('/comments/'+commentId)
            .auth(accessToken, { type: "bearer" })
            .send(newComment)
            .expect(204)
        await request(server)
            .get('/comments/'+commentId)
            .expect(200)
            .then(response => {
                expect(response.body.content).toContain('valid content')
            })
    });

    it('should return 204 and erase {comment}', async () => {
        await populateDBWithSomeComments(commentsRepo,usersRepo,2,existingUserId, existingPostId)
        const commentId: string = await getSomeExistingCommentId(commentsRepo)
        await request(server)
            .delete('/comments/'+commentId)
            .auth(accessToken, { type: "bearer" })
            .expect(204)
        await request(server)
            .get('/comments/'+commentId)
            .expect(404)
    });

    it('should return 403 for attempting deletion of other\'s comment', async () => {
        await populateDBWithSomeComments(commentsRepo,usersRepo,2,existingUserId, existingPostId)
        const commentId: string = await getSomeExistingCommentId(commentsRepo)
        const {login, password} = await addToDBSomeUser(usersRepo,'wrong-user')
        accessToken = (await request(server)
            .post('/login')
            .send({loginOrEmail: login, password: password})).body.accessToken
        request(server)
            .delete('/comments/'+commentId)
            .auth(accessToken, { type: "bearer" })
            .expect(403)
    });
})