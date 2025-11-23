import { Inject, Injectable } from '@nestjs/common';
import { IPostsQueryRepo } from '../../Service/posts.service';
import { PostPSQL, PostViewModel } from '../../posts.models';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import { LikesInfo } from '../../../comments/comments.models';
import { LikePSQL } from '../../../likes/likes.models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LikesRepositoryPSQL } from '../../../likes/Repository/likes.repository.psql';

@Injectable()
export class PostsQueryRepoPSQL implements IPostsQueryRepo {
  constructor(
    @InjectRepository(PostPSQL)
    private readonly repo: Repository<PostPSQL>,
    @Inject(LikesRepositoryPSQL)
    private readonly likesRepo: LikesRepositoryPSQL,
  ) {}
  async findWithSearchAndPagination(
    blogId: string,
    paginationSettings: Paginator,
    userId: string,
  ): Promise<Paginated<PostViewModel>> {
    const { pageSize, pageNumber, sortBy, sortDirection } = paginationSettings;

    let baseQuery: SelectQueryBuilder<PostPSQL> = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'blog');

    if (blogId) {
      baseQuery = baseQuery.where('p.blogId = :id', { id: blogId });
    }

    if (sortBy === 'blogName') {
      baseQuery = baseQuery.orderBy(
        `"blog"."name"`,
        sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      baseQuery = baseQuery.orderBy(
        `"p.${sortBy}"`,
        sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    const posts: PostPSQL[] = await baseQuery
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getMany();

    const totalCount: number = await baseQuery.getCount();

    const postsVM: PostViewModel[] = [];
    for (const post of posts) {
      const likeInfo: LikesInfo = await this.likesRepo.gatherLikesInfoOf(
        post.id,
        userId,
      );
      const latestLikes: LikePSQL[] = await this.likesRepo.getLatestLikes(
        post.id,
      );
      postsVM.push(await post.mapToViewModel(likeInfo, latestLikes));
    }

    return paginationSettings.Paginate(+totalCount, postsVM);
  }

  async findById(id: string, userId: string): Promise<PostViewModel | null> {
    const post: PostPSQL | null = await this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'blog')
      .where('p.id = :id', { id: id })
      .getOne();

    if (!post) {
      return null;
    }
    const likeInfo: LikesInfo = await this.likesRepo.gatherLikesInfoOf(
      post.id,
      userId,
    );
    const latestLikes: LikePSQL[] = await this.likesRepo.getLatestLikes(
      post.id,
    );
    return post.mapToViewModel(likeInfo, latestLikes);
  }
}
