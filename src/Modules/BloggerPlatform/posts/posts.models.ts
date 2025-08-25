import { HydratedDocument, Model } from 'mongoose';
import { likesInfo } from '../comments/comments.models';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlogsRepository } from '../blogs/blogs.repository';
import { NotFoundException } from '@nestjs/common';
import { BlogDocument } from '../blogs/blogs.models';
import { likeStatus } from '../likes/likes.models';

export type PostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

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

type ExtendedLikesInfo = likesInfo & {
  newestLikes: {
    addedAt: string;
    userId: string;
    login: string;
  }[];
};

@Schema({ timestamps: true })
export class Post {
  //TODO: Ограничения по длине?
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  createdAt: Date;

  static async CreateDocument(
    inputPost: PostInputModel,
    blogRepo: BlogsRepository,
  ): Promise<PostDocument> {
    const post = new this();
    post.title = inputPost.title;
    post.shortDescription = inputPost.shortDescription;
    post.content = inputPost.content;
    const blog: BlogDocument | null = await blogRepo.findById(inputPost.blogId);
    if (!blog) throw new NotFoundException();
    post.blogId = blog._id.toString();
    post.blogName = blog.name;
    return post as PostDocument;
  }

  async Update(
    newPost: PostInputModel,
    blogRepo: BlogsRepository,
  ): Promise<void> {
    this.title = newPost.title;
    this.shortDescription = newPost.shortDescription;
    this.content = newPost.content;
    //TODO: Вынести поход в БД из класса если это не по понятиям
    const blog: BlogDocument | null = await blogRepo.findById(newPost.blogId);
    if (!blog) throw new NotFoundException();
    this.blogId = blog._id.toString();
    this.blogName = blog.name;
  }

  mapToViewModel(this: PostDocument): PostViewModel {
    return {
      id: this._id.toString(),
      title: this.title,
      shortDescription: this.shortDescription,
      content: this.content,
      blogId: this.blogId,
      blogName: this.blogName,
      createdAt: this.createdAt,
      //TODO: Подтянуть лайки
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
        newestLikes: [],
      },
    };
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;
