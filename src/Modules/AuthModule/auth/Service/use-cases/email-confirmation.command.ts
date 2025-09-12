import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { UserDocument } from '../../../users/users.models';

export class ConfirmEmailCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailHandler
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private readonly usersRepo: UsersRepository) {}

  async execute({ code }: ConfirmEmailCommand): Promise<boolean> {
    const userToConfirm: UserDocument | null =
      await this.usersRepo.findWithCode(code);
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
    userToConfirm.confirmationData.isConfirmed = true;
    return !!(await this.usersRepo.save(userToConfirm));
  }
}
