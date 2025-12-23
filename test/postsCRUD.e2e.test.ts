import { initTestingModule, startTestServer } from './helpers/app-start';
import http from 'http';
import { BlogsRepositoryPSQL } from '../src/Modules/BloggerPlatform/blogs/Repository/PostgreSQL/blogs.repository.psql';
import { PostsRepositoryPSQL } from '../src/Modules/BloggerPlatform/posts/Repository/PostgreSQL/posts.repository.psql';
import { BloggerPlatformModule } from '../src/Modules/BloggerPlatform/bloggerPlatform.module';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../src/Modules/AuthModule/auth.module';
import { getSomeExistingBlogId, populateDBWithSomeBlogs } from './helpers/blog-helpers';
import { PostInputModel } from '../src/Modules/BloggerPlatform/posts/posts.entity';
import request from 'supertest';
import { createSomePostInputObject, getSomeExistingPostId, populateDBWithSomePosts } from './helpers/post-helpers';
import { NestExpressApplication } from '@nestjs/platform-express';


describe('Testing CRUD for posts',()=>{
  let app: NestExpressApplication;
  let server: http.Server;
  let existingBlogId: string;
  let blogsRepo: BlogsRepositoryPSQL
  let postsRepo: PostsRepositoryPSQL

    beforeAll(async ()=>{
      const moduleRef = await initTestingModule([
        BloggerPlatformModule,
        CqrsModule.forRoot(),
        AuthModule,
      ]);

      blogsRepo = moduleRef.get(BlogsRepositoryPSQL);
      postsRepo = moduleRef.get(PostsRepositoryPSQL);

      ({app,server} = await startTestServer(moduleRef))

      await blogsRepo.deleteAll()
      await postsRepo.deleteAll()
      await populateDBWithSomeBlogs(blogsRepo,2)
      existingBlogId = await getSomeExistingBlogId(blogsRepo)
    })

  afterAll(async () => {
    await app.close();
  });

    afterEach(async ()=>{
        await postsRepo.deleteAll()
    })

    it('should return status 201 and {post}', async () => {
        const postToSend: PostInputModel = createSomePostInputObject(existingBlogId)
        await request(server)
            .post('/sa/blogs/'+existingBlogId+'/posts')
            .auth('admin','qwerty')
            .send(postToSend)
            .expect(201)
            .then(response => {
                expect(response.body.title).toEqual(postToSend.title);
                expect(response.body.shortDescription).toEqual(postToSend.shortDescription);
                expect(response.body.content).toEqual(postToSend.content);
                expect(response.body.blogName).toContain('valid name');
            })
    });

    it('should return [2{post}]', async () => {
        await populateDBWithSomePosts(postsRepo, blogsRepo, 5,existingBlogId)
        await request(server)
            .get('/posts?pageSize=4')
            .expect(200)
            .then(response => {
                expect(response.body.pagesCount).toEqual(2);
                expect(response.body.page).toEqual(1);
                expect(response.body.pageSize).toEqual(4);
                expect(response.body.totalCount).toEqual(5);
                expect(response.body.items).toHaveLength(4);
            })
    });

    it('should return 1 exact {post}', async () => {
        await populateDBWithSomePosts(postsRepo, blogsRepo, 2,existingBlogId)
        const postId: string = await getSomeExistingPostId(postsRepo)
        await request(server)
            .get('/posts/'+postId)
            .expect(200)
            .then(response => {
                expect(response.body.id).toEqual(postId);
            })
    });

    it('should return 204 and update {blog}', async () => {
        await populateDBWithSomePosts(postsRepo, blogsRepo, 2,existingBlogId)
        const postId: string = await getSomeExistingPostId(postsRepo)
        const newPost: PostInputModel = createSomePostInputObject(existingBlogId)
        await request(server)
            .put('/sa/blogs/'+existingBlogId+'/posts/'+postId)
            .auth('admin','qwerty')
            .send(newPost)
            .expect(204)
        await request(server)
            .get('/posts/'+postId)
            .expect(200)
            .then(response => {
                expect(response.body.title).toEqual(newPost.title);
                expect(response.body.shortDescription).toEqual(newPost.shortDescription);
                expect(response.body.content).toEqual(newPost.content);
                expect(response.body.blogName).toContain('valid name');
            })
    });

    it('should return 204 and erase {blog}', async () => {
        await populateDBWithSomePosts(postsRepo, blogsRepo, 2,existingBlogId)
        const postId: string = await getSomeExistingPostId(postsRepo)
        await request(server)
            .delete('/sa/blogs/'+existingBlogId+'/posts/'+postId)
            .auth('admin','qwerty')
            .expect(204)
        await request(server)
            .get('/posts/'+postId)
            .expect(404)
    });
})