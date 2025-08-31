import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import {
  User,
  UserDocument,
  UserInputModel,
  type UserModelType,
} from './users.models';
import { InjectModel } from '@nestjs/mongoose';
import { HashService } from '../../Crypto/bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private repository: UsersRepository,
    private crypto: HashService,
    @InjectModel(User.name) protected UserModel: UserModelType,
  ) {}

  async postOneUser(
    user: UserInputModel,
    admin: boolean = false,
  ): Promise<UserDocument> {
    if (await this.repository.findByLoginOrEmail(user.login)) {
      throw new BadRequestException('login must be unique');
    }
    if (await this.repository.findByLoginOrEmail(user.email)) {
      throw new BadRequestException('email must be unique');
    }
    user.password = await this.crypto.toHash(user.password);
    const newUser: UserDocument = admin
      ? this.UserModel.CreateAdminUser(user)
      : this.UserModel.CreateRegularUser(user);
    return await this.repository.save(newUser);
  }

  async deleteOneUser(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
