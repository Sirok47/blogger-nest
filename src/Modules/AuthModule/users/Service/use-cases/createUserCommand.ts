import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  UserInputModel,
  type UserModelType,
  UserViewModel,
} from '../../users.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { HashService } from '../../../../Crypto/bcrypt';
import { type IUsersRepository, USERS_REPOSITORY } from '../users.service';

export class CreateUserCommand {
  constructor(
    public readonly user: UserInputModel,
    public readonly admin: boolean = false,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly crypto: HashService,
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserViewModel> {
    const { user, admin } = command;

    if (await this.usersRepository.findByLoginOrEmail(user.login)) {
      throw new BadRequestException('login must be unique');
    }
    if (await this.usersRepository.findByLoginOrEmail(user.email)) {
      throw new BadRequestException('email must be unique');
    }

    user.password = await this.crypto.toHash(user.password);

    const newUser: UserDocument = admin
      ? this.UserModel.CreateAdminUser(user)
      : this.UserModel.CreateRegularUser(user);
    return User.mapSQLToViewModel(await this.usersRepository.save(newUser));
  }
}
