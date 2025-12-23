import { User, UserInputModel } from '../../users.entity';
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
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { user, admin } = command;

    if (await this.usersRepository.findByLoginOrEmail(user.login)) {
      throw new BadRequestException('login must be unique');
    }
    if (await this.usersRepository.findByLoginOrEmail(user.email)) {
      throw new BadRequestException('email must be unique');
    }

    user.password = await this.crypto.toHash(user.password);

    const newUser: User = admin
      ? this.usersRepository.createAdmin(user)
      : this.usersRepository.createUser(user);
    return await this.usersRepository.save(newUser);
  }
}
