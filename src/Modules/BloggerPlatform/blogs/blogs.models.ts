import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsUrl, Length } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostPSQL } from '../posts/posts.models';

export class BlogInputModel {
  @Length(1, 15)
  name: string;

  @Length(1, 500)
  description: string;

  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}

export type BlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
};

export interface Blog {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  readonly createdAt: Date;

  Update(newBlog: BlogInputModel): void;
  mapToViewModel(this: Blog): BlogViewModel;
}

@Schema({ timestamps: true })
export class BlogMongo {
  readonly id: string;

  @Prop({ type: String, required: true, min: 1, max: 50 })
  name: string;

  @Prop({ type: String, required: true, min: 1, max: 1000 })
  description: string;

  @Prop({ type: String, required: true, min: 1, max: 200 })
  websiteUrl: string;

  @Prop({ type: Boolean, required: true })
  isMembership: boolean;

  readonly createdAt: Date;

  static CreateDocument(inputBlog: BlogInputModel): BlogDocument {
    const blog = new this();
    blog.name = inputBlog.name;
    blog.description = inputBlog.description;
    blog.websiteUrl = inputBlog.websiteUrl;
    blog.isMembership = false;
    return blog as BlogDocument;
  }

  Update(newBlog: BlogInputModel) {
    this.name = newBlog.name;
    this.description = newBlog.description;
    this.websiteUrl = newBlog.websiteUrl;
  }

  mapToViewModel(): BlogViewModel {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      isMembership: this.isMembership,
      createdAt: this.createdAt,
    };
  }
}

export const BlogSchema = SchemaFactory.createForClass(BlogMongo);
BlogSchema.loadClass(BlogMongo);

export type BlogDocument = HydratedDocument<BlogMongo>;
export type BlogModelType = Model<BlogDocument> & typeof BlogMongo;

@Entity('Blogs')
export class BlogPSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50 })
  name: string;

  @Column('varchar', { length: 1000 })
  description: string;

  @Column('varchar', { length: 200 })
  websiteUrl: string;

  @Column('boolean', { default: false })
  isMembership: boolean;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => PostPSQL, (post) => post.blog)
  posts: PostPSQL[];

  static CreateDocument(inputBlog: BlogInputModel): BlogPSQL {
    const blog = new this();
    blog.name = inputBlog.name;
    blog.description = inputBlog.description;
    blog.websiteUrl = inputBlog.websiteUrl;
    blog.isMembership = false;
    return blog;
  }

  Update(newBlog: BlogInputModel) {
    this.name = newBlog.name;
    this.description = newBlog.description;
    this.websiteUrl = newBlog.websiteUrl;
  }

  mapToViewModel(): BlogViewModel {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      isMembership: this.isMembership,
      createdAt: this.createdAt,
    };
  }

  static mapSQLToViewModel(blog: Blog): BlogViewModel {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      isMembership: blog.isMembership,
      createdAt: blog.createdAt,
    };
  }
}
