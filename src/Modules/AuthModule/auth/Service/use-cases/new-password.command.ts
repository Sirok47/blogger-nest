import { UsersRepository } from '../../../users/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HashService } from '../../../../Crypto/bcrypt';
import { UserDocument } from '../../../users/users.models';

export class ConfirmPasswordChangeCommand {
  constructor(
    public readonly code: string,
    public readonly newPass: string,
  ) {}
}

@CommandHandler(ConfirmPasswordChangeCommand)
export class ConfirmPasswordChangeHandler
  implements ICommandHandler<ConfirmPasswordChangeCommand>
{
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly crypto: HashService,
  ) {}

  async execute({
    code,
    newPass,
  }: ConfirmPasswordChangeCommand): Promise<boolean> {
    const userToConfirm: UserDocument | null =
      await this.usersRepo.findWithCode(code);
    if (!userToConfirm || !userToConfirm.confirmationData.isConfirmed) {
      return false;
    }
    if (
      new Date().getTime() >
      userToConfirm.confirmationData.confirmationCodeExpDate.getTime()
    ) {
      return false;
    }
    return await this.usersRepo.changePassword(
      userToConfirm._id.toString(),
      await this.crypto.toHash(newPass),
    );
  }
}
