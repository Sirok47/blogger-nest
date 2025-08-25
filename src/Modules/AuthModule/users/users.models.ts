import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { generateUuid } from '../../../Helpers/uuid';
import { addOneDay } from '../../../Helpers/dateHelpers';

export type UserInputModel = {
  login: string;
  password: string;
  email: string;
};

export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};

export type LoginInputModel = {
  loginOrEmail: string;
  password: string;
};

export type MeViewModel = {
  userId: string;
  login: string;
  email: string;
};

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
export class User {
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
    //TODO: toHash()
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
      confirmationCode: '',
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

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
