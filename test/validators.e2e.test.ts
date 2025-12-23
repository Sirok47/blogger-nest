import http from "http";
import request from "supertest";
import {createSomeBlogInputObject} from "./helpers/blog-helpers";
import {createSomePostInputObject} from "./helpers/post-helpers";
import { NestExpressApplication } from '@nestjs/platform-express';
import { initTestingModule, startTestServer } from './helpers/app-start';
import { BloggerPlatformModule } from '../src/Modules/BloggerPlatform/bloggerPlatform.module';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../src/Modules/AuthModule/auth.module';

describe('Testing validators with invalid data', () => {
    let app: NestExpressApplication;
    let server: http.Server;

    beforeAll(async () => {
      const moduleRef = await initTestingModule([
        BloggerPlatformModule,
        CqrsModule.forRoot(),
        AuthModule,
      ]);

      ({app,server} = await startTestServer(moduleRef))
    })

    afterAll(async ()=>{
      await app.close();
    })

    it('Should return 401 for attempting posting without creds', async () => {
        await request(server)
            .post('/sa/blogs')
            .expect(401)
    })

    it('Should return status 400 with errMsgs', async () => {
        await request(server)
            .get('/blogs?sortDirection=invalid&pageNumber=invalid&pageSize=invalid')
            .expect(400)
            .then(response => {
                expect(response.body.errorsMessages).toHaveLength(3);
            })
    })

    it('Should return status 400 with errMsgs', async () => {
        const invalidBlog = createSomeBlogInputObject('tooLongggggggggggggggggggggggggggggggggggggggggg','','not_a_URL')
        await request(server)
            .post('/sa/blogs')
            .auth('admin', 'qwerty')
            .send(invalidBlog)
            .expect(400)
            .then(response => {
                expect(response.body.errorsMessages).toHaveLength(3);
            })
    })

    it('Should return status 400 with errMsgs', async () => {
        const invalidPost = createSomePostInputObject('not_an_ID','tooLongggggggggggggggggggggggggggggggggggggggggg','tooLonggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg......................................','')
        await request(server)
            .post('/sa/blogs/notId/posts')
            .auth('admin', 'qwerty')
            .send(invalidPost)
            .expect(400)
            .then(response => {
                expect(response.body.errorsMessages).toHaveLength(3);
            })
    })
})