import { MailerService } from '../../../../Mailer/mailer.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { UserDocument } from '../../../users/users.models';
import { generateUuid } from '../../../../../Helpers/uuid';
import { addOneDay } from '../../../../../Helpers/dateHelpers';

export class RecoverPasswordCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(RecoverPasswordCommand)
export class RecoverPasswordHandler
  implements ICommandHandler<RecoverPasswordCommand>
{
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly mailer: MailerService,
  ) {}

  async execute({ email }: RecoverPasswordCommand): Promise<boolean> {
    const userToSendTo: UserDocument | null =
      await this.usersRepo.findByLoginOrEmail(email);
    if (!userToSendTo || !userToSendTo.confirmationData.isConfirmed) {
      return true;
    }
    const newCode = generateUuid();
    const result = await this.usersRepo.updateConfirmationCode(
      userToSendTo._id.toString(),
      newCode,
      addOneDay(new Date()),
    );
    if (!result) {
      return false;
    }
    await this.mailer.sendEmailWithConfirmationCode(
      email,
      newCode,
      'recoveryCode',
    );
    return true;
  }
}
