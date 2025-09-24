import { Inject, Injectable } from '@nestjs/common';
import {
  User,
  UserDocument,
  type UserModelType,
  UserViewModel,
} from '../users.models';
import { InjectModel } from '@nestjs/mongoose';
import { HashService } from '../../../Crypto/bcrypt';
import { Paginated, Paginator } from '../../../../Models/paginator.models';

export interface IUsersRepository {
  save(user: UserDocument): Promise<UserDocument>;

  findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null>;

  findById(id: string): Promise<UserDocument | null>;

  findWithCode(code: string): Promise<UserDocument | null>;

  changePassword(userId: string, newPass: string): Promise<boolean>;

  updateConfirmationCode(
    userId: string,
    code: string,
    expDate: Date,
  ): Promise<boolean>;

  setToConfirmed(code: string): Promise<boolean>;

  delete(id: string): Promise<boolean>;

  retrievePassword(id: string): Promise<string | undefined>;

  deleteAll(): Promise<void>;
}

export const USERS_REPOSITORY = Symbol('IUsersRepository');

export interface IUsersQueryRepo {
  findWithSearchAndPagination(
    paginationSettings: Paginator,
  ): Promise<Paginated<UserViewModel>>;

  findOneById(id: string): Promise<UserDocument | null>;
}

export const USERS_QUERY_REPO = Symbol('IUsersQueryRepo');

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private repository: IUsersRepository,
    private crypto: HashService,
    @InjectModel(User.name) protected UserModel: UserModelType,
  ) {}
}
