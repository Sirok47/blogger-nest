import { HydratedDocument, Model } from 'mongoose';
import { CommentPSQL, LikesInfo } from '../comments/comments.models';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Blog, BlogMongo, BlogPSQL } from '../blogs/blogs.models';
import { Like, LikeDocument, LikePSQL } from '../likes/likes.models';
import { IsMongoId, Length } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BlogsRepositoryPSQL } from '../blogs/Repository/PostgreSQL/blogs.repository.psql';
import { BlogsRepository } from '../blogs/Repository/MongoDB/blogs.repository';
import { UserMongo } from '../../AuthModule/users/users.models';

export class PostUnderBlogInputModel {
  @Length(1, 30)
  title: string;

  @Length(1, 100)
  shortDescription: string;

  @Length(1, 1000)
  content: string;

  blogId: string;
}

export class PostInputModel extends PostUnderBlogInputModel {
  @IsMongoId()
  blogId: string = '';
}

export type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;
};

export type LatestLikesVM = {
  addedAt: string;
  userId: string;
  login: string;
};

type ExtendedLikesInfo = LikesInfo & {
  newestLikes: LatestLikesVM[];
};

export interface Post {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  readonly createdAt: Date;

  Update(newPost: PostInputModel, blog: Blog | null): void;
  mapToViewModel(lInfo: LikesInfo, latestLikes: Like[]): Promise<PostViewModel>;
}

@Schema({ timestamps: true })
export class PostMongo implements Post {
  @InjectModel(BlogMongo.name) private readonly blogsRepo: BlogsRepository;
  readonly id: string;

  @Prop({ type: String, required: true, min: 1, max: 100 })
  title: string;

  @Prop({ type: String, required: true, min: 1, max: 300 })
  shortDescription: string;

  @Prop({ type: String, required: true, min: 1, max: 2000 })
  content: string;

  @Prop({ type: String, required: true, min: 20, max: 40 })
  blogId: string;

  readonly createdAt: Date;

  static async CreateDocument(
    inputPost: PostInputModel,
    blogRepo: BlogsRepository,
  ): Promise<PostDocument> {
    const post = new this();
    post.title = inputPost.title;
    post.shortDescription = inputPost.shortDescription;
    post.content = inputPost.content;
    const blog: Blog | null = await blogRepo.findById(inputPost.blogId);
    if (!blog) throw new NotFoundException();
    post.blogId = blog.id;
    return post as PostDocument;
  }

  Update(newPost: PostInputModel, blog: Blog | null): void {
    this.title = newPost.title;
    this.shortDescription = newPost.shortDescription;
    this.content = newPost.content;
    if (!blog) throw new NotFoundException();
    this.blogId = blog.id;
  }

  async mapToViewModel(
    lInfo: LikesInfo,
    latestLikes: LikeDocument[],
  ): Promise<PostViewModel> {
    return {
      id: this.id,
      title: this.title,
      shortDescription: this.shortDescription,
      content: this.content,
      blogId: this.blogId,
      blogName: (await this.blogsRepo.findById(this.blogId))!.name,
      createdAt: this.createdAt,
      extendedLikesInfo: {
        ...lInfo,
        newestLikes: ((likes: LikeDocument[]): LatestLikesVM[] => {
          const result: LatestLikesVM[] = [];
          for (const like of likes) {
            result.push({
              addedAt: like.createdAt.toISOString(),
              userId: like.userId,
              login: (like.user as UserMongo).login,
            });
          }
          return result;
        })(latestLikes),
      },
    };
  }
}

export const PostSchema = SchemaFactory.createForClass(PostMongo);
PostSchema.loadClass(PostMongo);

export type PostDocument = HydratedDocument<PostMongo>;
export type PostModelType = Model<PostDocument> & typeof PostMongo;

@Entity('Posts')
export class PostPSQL implements Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  title: string;

  @Column('varchar', { length: 300 })
  shortDescription: string;

  @Column('varchar', { length: 2000 })
  content: string;

  @ManyToOne(() => BlogPSQL, (blog) => blog.posts)
  blog: BlogPSQL;
  @Column()
  blogId: string;

  @Column('timestamp without time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => CommentPSQL, (comment) => comment.post)
  comments: CommentPSQL;

  static async CreateDocument(
    inputPost: PostInputModel,
    blogRepo: BlogsRepositoryPSQL,
  ): Promise<PostPSQL> {
    const post = new this();
    post.title = inputPost.title;
    post.shortDescription = inputPost.shortDescription;
    post.content = inputPost.content;
    const blog: BlogPSQL | null = await blogRepo.findById(inputPost.blogId);
    if (!blog) throw new NotFoundException();
    post.blog = blog;
    return post;
  }

  Update(newPost: PostInputModel, blog: Blog | null): void {
    this.title = newPost.title;
    this.shortDescription = newPost.shortDescription;
    this.content = newPost.content;
    if (!blog) throw new NotFoundException();
    this.blogId = blog.id;
  }

  async mapToViewModel(
    lInfo: LikesInfo,
    latestLikes: LikePSQL[],
  ): Promise<PostViewModel> {
    return {
      id: this.id,
      title: this.title,
      shortDescription: this.shortDescription,
      content: this.content,
      blogId: this.blogId,
      blogName: this.blog.name,
      createdAt: this.createdAt,
      extendedLikesInfo: {
        ...lInfo,
        newestLikes: ((likes: LikePSQL[]): LatestLikesVM[] => {
          const result: LatestLikesVM[] = [];
          for (const like of likes) {
            result.push({
              addedAt: like.createdAt.toISOString(),
              userId: like.userId,
              login: like.user.login,
            });
          }
          return result;
        })(latestLikes),
      },
    };
  }

  static mapSQLToViewModel(
    post: Post & { blogName: string },
    lInfo: LikesInfo,
    latestLikes: (Like & { login: string })[],
  ): PostViewModel {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        ...lInfo,
        newestLikes: ((
          likes: (Like & { login: string })[],
        ): LatestLikesVM[] => {
          const result: LatestLikesVM[] = [];
          for (const like of likes) {
            result.push({
              addedAt: like.createdAt.toISOString(),
              userId: like.userId,
              login: like.login,
            });
          }
          return result;
        })(latestLikes),
      },
    };
  }
}
