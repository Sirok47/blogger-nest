import { User, UserDocument, type UserModelType } from './users.models';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

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
      confirmationData: { confirmationCode: code },
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
        $set: { confirmationCode: code, confirmationCodeExpDate: expDate },
      },
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
