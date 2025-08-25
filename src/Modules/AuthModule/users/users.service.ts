import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import {
  User,
  UserDocument,
  UserInputModel,
  type UserModelType,
  UserViewModel,
} from './users.models';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(
    private repository: UsersRepository,
    @InjectModel(User.name) protected UserModel: UserModelType,
  ) {}

  async postOneUser(user: UserInputModel): Promise<UserViewModel> {
    if (await this.repository.findByLoginOrEmail(user.login)) {
      throw new BadRequestException('login must be unique');
    }
    if (await this.repository.findByLoginOrEmail(user.email)) {
      throw new BadRequestException('email must be unique');
    }
    const newUser: UserDocument = this.UserModel.CreateAdminUser(user);
    return (await this.repository.save(newUser)).mapToViewModel();
  }

  async deleteOneUser(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
