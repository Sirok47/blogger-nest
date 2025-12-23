import { Blog, BlogInputModel, BlogPSQL } from '../../src/Modules/BloggerPlatform/blogs/blogs.entity';
import {
  BlogsRepositoryPSQL
} from '../../src/Modules/BloggerPlatform/blogs/Repository/PostgreSQL/blogs.repository.psql';

export function createSomeBlogInputObject(name: string = 'valid name',
                                          description: string = 'valid description',
                                          websiteUrl: string = 'https://validUrl.com'): BlogInputModel{
    return {
        name: name,
        description: description,
        websiteUrl: websiteUrl,
    }
}

export async function populateDBWithSomeBlogs(blogsRepo: BlogsRepositoryPSQL, quantity: number){
    const blogsProm: Promise<Blog>[] = []
    for (let i = 0; i < quantity; i++) {
        const blog: BlogPSQL = BlogPSQL.CreateDocument({
            ...createSomeBlogInputObject('valid name '+i,'valid description '+i),
        })
      blogsProm.push(blogsRepo.save(blog))
    }
    await Promise.all(blogsProm);
}

export async function getSomeExistingBlogId(blogsRepo: BlogsRepositoryPSQL): Promise<string> {
    return (await blogsRepo.findRandom())!.id
}
