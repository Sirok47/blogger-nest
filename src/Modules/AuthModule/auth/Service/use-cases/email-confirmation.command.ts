import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../users/Service/users.service';
import { User } from '../../../users/users.models';
import { Inject } from '@nestjs/common';

export class ConfirmEmailCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailHandler
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepo: IUsersRepository,
  ) {}

  async execute({ code }: ConfirmEmailCommand): Promise<boolean> {
    const userToConfirm: User | null = await this.usersRepo.findWithCode(code);
    if (!userToConfirm) {
      throw new Error('No such code');
    }
    if (userToConfirm.confirmationData.isConfirmed) {
      throw new Error('Already confirmed');
    }
    if (
      new Date().getTime() >
      userToConfirm.confirmationData.confirmationCodeExpDate.getTime()
    ) {
      throw new Error('Code expired');
    }
    return await this.usersRepo.setToConfirmed(code);
  }
}
