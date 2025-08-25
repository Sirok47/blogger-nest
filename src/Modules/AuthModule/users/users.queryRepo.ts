import { Injectable } from '@nestjs/common';
import {
  User,
  UserDocument,
  type UserModelType,
  UserViewModel,
} from './users.models';
import { Paginated, Paginator } from '../../../Models/paginator.models';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersQueryRepo {
  constructor(@InjectModel(User.name) protected UserModel: UserModelType) {}
  async findWithSearchAndPagination(
    paginationSettings: Paginator,
  ): Promise<Paginated<UserViewModel>> {
    const { searchLoginTerm, searchEmailTerm } = paginationSettings;
    const filter = {
      $or: [{}],
    };

    //TODO: Разобрать это безобразие
    if (searchLoginTerm)
      filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
    if (searchEmailTerm)
      filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
    if (filter.$or.length > 1) {
      filter.$or.shift();
    }

    const query = this.UserModel.find(filter);
    const totalCount = await this.UserModel.countDocuments(filter);

    let users: UserDocument[];
    if (!paginationSettings) {
      users = await query.exec();
    } else {
      users = await paginationSettings.LimitQuery<UserDocument>(query).exec();
    }

    return paginationSettings.Paginate<UserViewModel>(
      totalCount,
      users.map((user: UserDocument): UserViewModel => user.mapToViewModel()),
    );
  }

  async findOneById(id: string): Promise<UserDocument | null> {
    return await this.UserModel.findById(id).exec();
  }
}
