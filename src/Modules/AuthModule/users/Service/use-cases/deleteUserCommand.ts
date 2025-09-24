import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { type IUsersRepository, USERS_REPOSITORY } from '../users.service';
import { Inject } from '@nestjs/common';

export class DeleteUserCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    return this.usersRepository.delete(command.id);
  }
}
