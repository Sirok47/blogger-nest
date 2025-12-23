import {
  User,
  UserDocument,
  UserInputModel,
  type UserModelType,
  UserMongo,
} from '../../users.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../Service/users.service';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@InjectModel(UserMongo.name) private UserModel: UserModelType) {}

  createAdmin(user: UserInputModel): User {
    return this.UserModel.CreateAdminUser(user);
  }

  createUser(user: UserInputModel): User {
    return this.UserModel.CreateRegularUser(user);
  }

  async save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return await this.UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return await this.UserModel.findById(id).exec();
  }

  async findWithCode(code: string): Promise<UserDocument | null> {
    return await this.UserModel.findOne({
      'confirmationData.confirmationCode': code,
    }).exec();
  }

  async changePassword(userId: string, newPass: string): Promise<boolean> {
    const result: UserDocument | null = await this.UserModel.findByIdAndUpdate(
      userId,
      { $set: { password: newPass } },
    );
    return !!result;
  }

  async updateConfirmationCode(
    userId: string,
    code: string,
    expDate: Date,
  ): Promise<boolean> {
    const result: UserDocument | null = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          'confirmationData.confirmationCode': code,
          'confirmationData.confirmationCodeExpDate': expDate,
        },
      },
      { new: true },
    );
    return !!result;
  }

  async setToConfirmed(code: string): Promise<boolean> {
    const result: UserDocument | null = await this.UserModel.findOneAndUpdate(
      { 'confirmationData.confirmationCode': code },
      {
        $set: {
          'confirmationData.isConfirmed': true,
        },
      },
      { new: true },
    );
    return !!result;
  }

  async delete(id: string): Promise<boolean> {
    const result: UserDocument | null =
      await this.UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async retrievePassword(id: string): Promise<string | undefined> {
    return (await this.UserModel.findById(id).exec())?.password;
  }

  async deleteAll(): Promise<void> {
    await this.UserModel.deleteMany();
  }
}
