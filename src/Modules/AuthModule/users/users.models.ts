import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { generateUuid } from '../../../Helpers/uuid';
import { addOneDay } from '../../../Helpers/dateHelpers';
import { IsEmail, Length } from 'class-validator';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SessionPSQL } from '../sessions/sessions.models';
import { LikePSQL } from '../../BloggerPlatform/likes/likes.models';
import { CommentPSQL } from '../../BloggerPlatform/comments/comments.models';
import { ConfirmationDataPSQL } from './confData.models';
import { PlayerPSQL } from '../../quiz-game/entities/player.entity';

export class UserInputModel {
  @Length(3, 10)
  login: string;

  @Length(6, 20)
  password: string;

  @IsEmail()
  email: string;
}

export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};

export class LoginInputModel {
  @Length(3)
  loginOrEmail: string;

  @Length(6, 20)
  password: string;
}

export type MeViewModel = {
  userId: string;
  login: string;
  email: string;
};

export interface User {
  id: string;
  login: string;
  password: string;
  email: string;
  confirmationData: ConfirmationData;
  readonly createdAt: Date;

  mapToViewModel(this: Omit<User, 'confirmationData'>): UserViewModel;
  mapToMeViewModel(this: Omit<User, 'confirmationData'>): MeViewModel;
}

@Schema({ _id: false })
class ConfirmationData {
  @Prop({ type: String, maxlength: 100 })
  confirmationCode: string;

  @Prop({ type: Date, required: true })
  confirmationCodeExpDate: Date;

  @Prop({ type: Boolean, required: true })
  isConfirmed: boolean;
}

const ConfirmationDataSchema = SchemaFactory.createForClass(ConfirmationData);
ConfirmationDataSchema.loadClass(ConfirmationData);

@Schema({ timestamps: true })
export class UserMongo implements User {
  readonly id: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  login: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  password: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  email: string;

  @Prop({ type: () => ConfirmationData, required: true })
  confirmationData: ConfirmationData;

  readonly createdAt: Date;

  private static userSkeleton(inputUser: UserInputModel) {
    const instance = new this();
    instance.login = inputUser.login;
    instance.email = inputUser.email;
    instance.password = inputUser.password;
    return instance;
  }

  static CreateRegularUser(inputUser: UserInputModel): UserDocument {
    const user = this.userSkeleton(inputUser);
    user.confirmationData = {
      confirmationCode: generateUuid(),
      confirmationCodeExpDate: addOneDay(new Date()),
      isConfirmed: false,
    };
    return user as UserDocument;
  }

  static CreateAdminUser(inputUser: UserInputModel): UserDocument {
    const user = this.userSkeleton(inputUser);
    user.confirmationData = {
      confirmationCode: generateUuid(),
      confirmationCodeExpDate: new Date(),
      isConfirmed: true,
    };
    return user as UserDocument;
  }

  mapToViewModel(this: UserDocument): UserViewModel {
    return {
      id: this._id.toString(),
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
    };
  }

  mapToMeViewModel(this: UserDocument): MeViewModel {
    return {
      userId: this._id.toString(),
      login: this.login,
      email: this.email,
    };
  }
}

export const UserSchema = SchemaFactory.createForClass(UserMongo);
UserSchema.loadClass(UserMongo);

export type UserDocument = HydratedDocument<UserMongo>;
export type UserModelType = Model<UserDocument> & typeof UserMongo;

@Entity('Users')
export class UserPSQL implements User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  login: string;

  @Column('varchar', { length: 100 })
  password: string;

  @Column('varchar', { length: 100 })
  email: string;

  // @Column('json')
  // confirmationData: ConfirmationDataPSQL;
  @OneToOne(() => ConfirmationDataPSQL, (data) => data.user, {
    cascade: true,
    eager: true,
  })
  confirmationData: ConfirmationDataPSQL;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => PlayerPSQL, (player) => player.user)
  players: PlayerPSQL[];

  @OneToMany(() => SessionPSQL, (session) => session.user)
  sessions: SessionPSQL[];

  @OneToMany(() => LikePSQL, (like) => like.user)
  likes: LikePSQL[];

  @OneToMany(() => CommentPSQL, (comment) => comment.commentator)
  comments: CommentPSQL[];

  private static userSkeleton(inputUser: UserInputModel) {
    const instance = new this();
    instance.login = inputUser.login;
    instance.email = inputUser.email;
    instance.password = inputUser.password;
    return instance;
  }

  static CreateRegularUser(inputUser: UserInputModel): UserPSQL {
    const user = this.userSkeleton(inputUser);
    const confData = new ConfirmationDataPSQL();
    confData.confirmationCode = generateUuid();
    confData.confirmationCodeExpDate = addOneDay(new Date());
    confData.isConfirmed = false;
    user.confirmationData = confData;
    return user;
  }

  static CreateAdminUser(inputUser: UserInputModel): UserPSQL {
    const user = this.userSkeleton(inputUser);
    const confData = new ConfirmationDataPSQL();
    confData.confirmationCode = generateUuid();
    confData.confirmationCodeExpDate = new Date();
    confData.isConfirmed = true;
    user.confirmationData = confData;
    return user;
  }

  mapToViewModel(this: Omit<UserPSQL, 'confirmationData'>): UserViewModel {
    return {
      id: this.id,
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
    };
  }

  mapToMeViewModel(this: Omit<UserPSQL, 'confirmationData'>): MeViewModel {
    return {
      userId: this.id,
      login: this.login,
      email: this.email,
    };
  }

  static mapSQLToViewModel(
    user: Omit<UserPSQL, 'confirmationData'>,
  ): UserViewModel {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  static mapSQLToMeViewModel(
    user: Omit<UserPSQL, 'confirmationData'>,
  ): MeViewModel {
    return {
      userId: user.id,
      login: user.login,
      email: user.email,
    };
  }
}
