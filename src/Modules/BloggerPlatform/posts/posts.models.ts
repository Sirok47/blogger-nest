import { HydratedDocument, Model } from 'mongoose';
import { LikesInfo } from '../comments/comments.models';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { BlogDocument } from '../blogs/blogs.models';
import { LikeDocument } from '../likes/likes.models';
import { IsMongoId, Length } from 'class-validator';
import { IBlogsRepository } from '../blogs/Service/blogs.service';

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

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true, min: 1, max: 100 })
  title: string;

  @Prop({ type: String, required: true, min: 1, max: 300 })
  shortDescription: string;

  @Prop({ type: String, required: true, min: 1, max: 2000 })
  content: string;

  @Prop({ type: String, required: true, min: 20, max: 40 })
  blogId: string;

  @Prop({ type: String, required: true, min: 1, max: 50 })
  blogName: string;

  readonly createdAt: Date;

  static async CreateDocument(
    inputPost: PostInputModel,
    blogRepo: IBlogsRepository,
  ): Promise<PostDocument> {
    const post = new this();
    post.title = inputPost.title;
    post.shortDescription = inputPost.shortDescription;
    post.content = inputPost.content;
    const blog: BlogDocument | null = await blogRepo.findById(inputPost.blogId);
    if (!blog) throw new NotFoundException();
    post.blogId = blog.id;
    post.blogName = blog.name;
    return post as PostDocument;
  }

  Update(newPost: PostInputModel, blog: BlogDocument | null): void {
    this.title = newPost.title;
    this.shortDescription = newPost.shortDescription;
    this.content = newPost.content;
    if (!blog) throw new NotFoundException();
    this.blogId = blog.id;
    this.blogName = blog.name;
  }

  mapToViewModel(
    this: PostDocument,
    lInfo: LikesInfo,
    latestLikes: LikeDocument[],
  ): PostViewModel {
    return {
      id: this.id,
      title: this.title,
      shortDescription: this.shortDescription,
      content: this.content,
      blogId: this.blogId,
      blogName: this.blogName,
      createdAt: this.createdAt,
      extendedLikesInfo: {
        ...lInfo,
        newestLikes: ((likes: LikeDocument[]): LatestLikesVM[] => {
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

  //SQL

  static mapSQLToViewModel(
    post: PostDocument,
    lInfo: LikesInfo,
    latestLikes: LikeDocument[],
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
        newestLikes: ((likes: LikeDocument[]): LatestLikesVM[] => {
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

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;
