import { PostInputModel } from "../../../Blogger platform/src/models/post-models";
import {
  PostsRepositoryPSQL
} from '../../src/Modules/BloggerPlatform/posts/Repository/PostgreSQL/posts.repository.psql';
import {
  BlogsRepositoryPSQL
} from '../../src/Modules/BloggerPlatform/blogs/Repository/PostgreSQL/blogs.repository.psql';
import { PostPSQL } from '../../src/Modules/BloggerPlatform/posts/posts.entity';

export function createSomePostInputObject(blogId: string,
                                          title: string = 'valid title',
                                          shortDescription: string = 'valid short description',
                                          content: string = 'valid content'): PostInputModel{
    return {
        title: title,
        shortDescription: shortDescription,
        content:content,
        blogId: blogId
    }
}

export async function populateDBWithSomePosts(postsRepo: PostsRepositoryPSQL,blogsRepo: BlogsRepositoryPSQL,quantity: number, blogId: string){
    const postsProms: Promise<PostPSQL>[] = []
    for (let i = 0; i < quantity; i++) {
        const post: PostPSQL = await PostPSQL.CreateDocument({
            ...createSomePostInputObject(blogId,'valid title '+i,'valid short description '+i,'valid content '+i),
        }, blogsRepo)
      postsProms.push(postsRepo.save(post))
    }
    await Promise.all(postsProms);
}

export async function getSomeExistingPostId(postsRepo: PostsRepositoryPSQL): Promise<string> {
    return (await postsRepo.findRandom())!.id
}