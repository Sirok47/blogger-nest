import request from 'supertest';
import { createSomeBlogInputObject, getSomeExistingBlogId, populateDBWithSomeBlogs } from './helpers/blog-helpers';
import { initTestingModule, startTestServer } from './helpers/app-start';
import { BloggerPlatformModule } from '../src/Modules/BloggerPlatform/bloggerPlatform.module';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../src/Modules/AuthModule/auth.module';
import { BlogInputModel } from '../src/Modules/BloggerPlatform/blogs/blogs.entity';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'http';
import { BlogsRepositoryPSQL } from '../src/Modules/BloggerPlatform/blogs/Repository/PostgreSQL/blogs.repository.psql';

describe('Testing CRUD for blogs', () => {
  let app: NestExpressApplication;
  let server: Server;
  let blogsRepo: BlogsRepositoryPSQL;

  beforeAll(async () => {
    const moduleRef = await initTestingModule([
      BloggerPlatformModule,
      CqrsModule.forRoot(),
      AuthModule,
    ]);

    blogsRepo = moduleRef.get(BlogsRepositoryPSQL);

    ({app,server} = await startTestServer(moduleRef))
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await blogsRepo.deleteAll();
  });

  it('should return status 201 and {blog}', async () => {
    const blogToSend: BlogInputModel = createSomeBlogInputObject();
    await request(server)
      .post('/sa/blogs')
      .auth('admin', 'qwerty')
      .send(blogToSend)
      .expect(201)
      .then((response) => {
        expect(response.body.name).toEqual(blogToSend.name);
        expect(response.body.description).toEqual(blogToSend.description);
        expect(response.body.websiteUrl).toEqual(blogToSend.websiteUrl);
        expect(response.body.isMembership).toEqual(false);
      });
  });

  it('should return [2{blog}]', async () => {
    await populateDBWithSomeBlogs(blogsRepo,3);
    await request(server)
      .get('/blogs?pageSize=2')
      .expect(200)
      .then((response) => {
        expect(response.body.pagesCount).toEqual(2);
        expect(response.body.page).toEqual(1);
        expect(response.body.pageSize).toEqual(2);
        expect(response.body.totalCount).toEqual(3);
        expect(response.body.items).toHaveLength(2);
      });
  });

  it('should return 1 exact {blog}', async () => {
    await populateDBWithSomeBlogs(blogsRepo,2);
    const blogId: string = await getSomeExistingBlogId(blogsRepo);
    await request(server)
      .get('/blogs/' + blogId)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toEqual(blogId);
      });
  });

  it('should return 204 and update {blog}', async () => {
    await populateDBWithSomeBlogs(blogsRepo,1);
    const blogId: string = await getSomeExistingBlogId(blogsRepo);
    const newBlog: BlogInputModel = createSomeBlogInputObject();
    await request(server)
      .put('/sa/blogs/' + blogId)
      .auth('admin', 'qwerty')
      .send(newBlog)
      .expect(204);
    await request(server)
      .get('/blogs/' + blogId)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toEqual(blogId);
        expect(response.body.name).toEqual(newBlog.name);
        expect(response.body.description).toEqual(newBlog.description);
        expect(response.body.websiteUrl).toEqual(newBlog.websiteUrl);
        expect(response.body.isMembership).toEqual(false);
      });
  });

  it('should return 204 and erase {blog}', async () => {
    await populateDBWithSomeBlogs(blogsRepo,2);
    const blogId: string = await getSomeExistingBlogId(blogsRepo);
    await request(server)
      .delete('/sa/blogs/' + blogId)
      .auth('admin', 'qwerty')
      .expect(204);
    await request(server)
      .get('/blogs/' + blogId)
      .expect(404);
  });
});