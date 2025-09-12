import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { User, type UserModelType } from '../users.models';
import { InjectModel } from '@nestjs/mongoose';
import { HashService } from '../../../Crypto/bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private repository: UsersRepository,
    private crypto: HashService,
    @InjectModel(User.name) protected UserModel: UserModelType,
  ) {}
}
