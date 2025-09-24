import { Injectable } from '@nestjs/common';
import {
  MeViewModel,
  User,
  UserDocument,
  type UserModelType,
  UserViewModel,
} from '../../users.models';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { IUsersQueryRepo } from '../../Service/users.service';

@Injectable()
export class UsersQueryRepo implements IUsersQueryRepo {
  constructor(@InjectModel(User.name) protected UserModel: UserModelType) {}
  async findWithSearchAndPagination(
    paginationSettings: Paginator,
  ): Promise<Paginated<UserViewModel>> {
    const { searchLoginTerm, searchEmailTerm } = paginationSettings;

    const filter: FilterQuery<User> = {
      $or: [
        { email: { $regex: searchEmailTerm ?? '', $options: 'i' } },
        { login: { $regex: searchLoginTerm ?? '', $options: 'i' } },
      ],
    };

    const query = this.UserModel.find(filter);
    const totalCount = await this.UserModel.countDocuments(filter);

    let users: UserDocument[];
    if (!paginationSettings) {
      users = await query.exec();
    } else {
      users = await paginationSettings.QueryForPage<UserDocument>(query).exec();
    }

    return paginationSettings.Paginate<UserViewModel>(
      totalCount,
      users.map((user: UserDocument): UserViewModel => user.mapToViewModel()),
    );
  }

  async findOneById(id: string): Promise<UserViewModel | null> {
    const result: UserDocument | null =
      await this.UserModel.findById(id).exec();
    if (!result) {
      return null;
    }
    return result.mapToViewModel();
  }

  async meView(id: string): Promise<MeViewModel | null> {
    const result: UserDocument | null =
      await this.UserModel.findById(id).exec();
    if (!result) {
      return null;
    }
    return result.mapToMeViewModel();
  }
}
