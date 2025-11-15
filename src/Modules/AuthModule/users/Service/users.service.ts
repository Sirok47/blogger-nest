import { Inject, Injectable } from '@nestjs/common';
import {
  MeViewModel,
  User,
  UserInputModel,
  type UserModelType,
  UserMongo,
  UserViewModel,
} from '../users.models';
import { InjectModel } from '@nestjs/mongoose';
import { HashService } from '../../../Crypto/bcrypt';
import { Paginated, Paginator } from '../../../../Models/paginator.models';

export interface IUsersRepository {
  createUser(inputUser: UserInputModel): User;

  createAdmin(inputUser: UserInputModel): User;

  save(user: User): Promise<User>;

  findByLoginOrEmail(loginOrEmail: string): Promise<User | null>;

  findById(id: string): Promise<User | null>;

  findWithCode(code: string): Promise<User | null>;

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

  findOneById(id: string): Promise<UserViewModel | null>;

  meView(id: string): Promise<MeViewModel | null>;
}

export const USERS_QUERY_REPO = Symbol('IUsersQueryRepo');

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private repository: IUsersRepository,
    private crypto: HashService,
    @InjectModel(UserMongo.name) protected UserModel: UserModelType,
  ) {}
}
