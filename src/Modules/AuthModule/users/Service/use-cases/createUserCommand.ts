import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  UserInputModel,
  type UserModelType,
} from '../../users.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../users.repository';
import { HashService } from '../../../../Crypto/bcrypt';

export class CreateUserCommand {
  constructor(
    public readonly user: UserInputModel,
    public readonly admin: boolean = false,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly crypto: HashService,
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserDocument> {
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

    return this.usersRepository.save(newUser);
  }
}
