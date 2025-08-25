import { HydratedDocument, Model } from 'mongoose';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
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

export class User {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  login: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  password: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  email: string;

  @Prop({ type: ConfirmationDataSchema, required: true })
  confirmationData: ConfirmationData;

  createdAt: Date;

  constructor(inputUser: UserInputModel) {
    this.login = inputUser.login;
    this.email = inputUser.email;
    //TODO: toHash()
    this.password = inputUser.password;
  }

  static CreateRegularUser(inputUser: UserInputModel): UserDocument {
    const user = new this(inputUser);
    user.confirmationData = {
      confirmationCode: generateUuid(),
      confirmationCodeExpDate: addOneDay(new Date()),
      isConfirmed: false,
    };
    return user as UserDocument;
  }

  static CreateAdminUser(inputUser: UserInputModel): UserDocument {
    const user = new this(inputUser);
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
