import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsUrl, Length } from 'class-validator';

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

@Schema({ timestamps: true })
export class Blog {
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

  mapToViewModel(this: BlogDocument): BlogViewModel {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      isMembership: this.isMembership,
      createdAt: this.createdAt,
    };
  }

  static mapSQLToViewModel(blog: BlogDocument): BlogViewModel {
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

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & typeof Blog;
