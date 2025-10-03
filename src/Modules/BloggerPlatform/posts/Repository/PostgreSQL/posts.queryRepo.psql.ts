import { Injectable } from '@nestjs/common';
import { IPostsQueryRepo } from '../../Service/posts.service';
import { Post, PostDocument, PostViewModel } from '../../posts.models';
import { LikesRepository } from '../../../likes/likes.repository';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import { likesInfo } from '../../../comments/comments.models';
import { LikeDocument, likeStatus } from '../../../likes/likes.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsQueryRepoPSQL implements IPostsQueryRepo {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly likesRepo: LikesRepository,
  ) {}
  async findWithSearchAndPagination(
    blogId: string,
    paginationSettings: Paginator,
    userId: string,
  ): Promise<Paginated<PostViewModel>> {
    const { pageSize, pageNumber, sortBy, sortDirection } = paginationSettings;

    const posts = await this.dataSource.query<PostDocument[]>(
      `
    SELECT * FROM "Posts"
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
      const likeInfo: likesInfo = {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
      };
      /*await this.likesRepo.gatherLikesInfoOf(
        post.id,
        userId,
      );*/
      const latestLikes: LikeDocument[] = [];
      /*await this.likesRepo.getLatestLikes(
        post.id,
      );*/
      postsVM.push(Post.mapSQLToViewModel(post, likeInfo, latestLikes));
    }

    return paginationSettings.Paginate(+totalCount, postsVM);
  }

  async findById(id: string, userId: string): Promise<PostViewModel | null> {
    const result: PostDocument[] = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE id=$1`,
      [id],
    );
    if (result.length !== 1) {
      return null;
    }
    const post = result[0];
    const likeInfo: likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus.None,
    };
    /*await this.likesRepo.gatherLikesInfoOf(
      post.id,
      userId,
    );*/
    const latestLikes: LikeDocument[] = [];
    /*await this.likesRepo.getLatestLikes(
      post.id,
    );*/
    return Post.mapSQLToViewModel(post, likeInfo, latestLikes);
  }
}
