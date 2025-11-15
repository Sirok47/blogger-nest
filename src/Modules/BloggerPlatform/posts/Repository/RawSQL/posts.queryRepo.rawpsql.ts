import { Inject, Injectable } from '@nestjs/common';
import { IPostsQueryRepo } from '../../Service/posts.service';
import { Post, PostPSQL, PostViewModel } from '../../posts.models';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import { LikesInfo } from '../../../comments/comments.models';
import { Like } from '../../../likes/likes.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikesRepositoryRawPSQL } from '../../../likes/Repository/likes.repository.rawpsql';

@Injectable()
export class PostsQueryRepoRawPSQL implements IPostsQueryRepo {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(LikesRepositoryRawPSQL)
    private readonly likesRepo: LikesRepositoryRawPSQL,
  ) {}
  async findWithSearchAndPagination(
    blogId: string,
    paginationSettings: Paginator,
    userId: string,
  ): Promise<Paginated<PostViewModel>> {
    const { pageSize, pageNumber, sortBy, sortDirection } = paginationSettings;

    const posts = await this.dataSource.query<(Post & { blogName: string })[]>(
      `
    SELECT *, b.name as "blogName" FROM "Posts"
    LEFT JOIN "Blogs" b ON "Posts.blogId" = "b.id"
        WHERE "blogId" ILIKE $1
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $2
        OFFSET $3
    `,
      [`%${blogId}%`, pageSize, (pageNumber - 1) * pageSize],
    );
    const totalCount = (
      await this.dataSource.query<{ count: string }[]>(
        `
        SELECT COUNT(*) FROM "Posts"
        WHERE "blogId" ILIKE $1`,
        [`%${blogId}%`],
      )
    )[0].count;
    const postsVM: PostViewModel[] = [];
    for (const post of posts) {
      const likeInfo: LikesInfo = await this.likesRepo.gatherLikesInfoOf(
        post.id,
        userId,
      );
      const latestLikes: (Like & { login: string })[] =
        await this.likesRepo.getLatestLikes(post.id);
      postsVM.push(PostPSQL.mapSQLToViewModel(post, likeInfo, latestLikes));
    }

    return paginationSettings.Paginate(+totalCount, postsVM);
  }

  async findById(id: string, userId: string): Promise<PostViewModel | null> {
    const result: (Post & { blogName: string })[] = await this.dataSource.query(
      `
        SELECT *, b.name as "blogName" FROM "Posts"
        LEFT JOIN "Blogs" b ON "Posts.blogId" = "b.id" 
            WHERE id=$1`,
      [id],
    );
    if (result.length !== 1) {
      return null;
    }
    const post = result[0];
    const likeInfo: LikesInfo = await this.likesRepo.gatherLikesInfoOf(
      post.id,
      userId,
    );
    const latestLikes: (Like & { login: string })[] =
      await this.likesRepo.getLatestLikes(post.id);
    return PostPSQL.mapSQLToViewModel(post, likeInfo, latestLikes);
  }
}
