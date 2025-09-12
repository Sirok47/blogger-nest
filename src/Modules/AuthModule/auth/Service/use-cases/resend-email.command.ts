import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { MailerService } from '../../../../Mailer/mailer.service';
import { UserDocument } from '../../../users/users.models';
import { generateUuid } from '../../../../../Helpers/uuid';
import { addOneDay } from '../../../../../Helpers/dateHelpers';

export class ResendConfirmationEmailCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailHandler
  implements ICommandHandler<ResendConfirmationEmailCommand>
{
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly mailer: MailerService,
  ) {}

  async execute({ email }: ResendConfirmationEmailCommand): Promise<boolean> {
    const userToSendTo: UserDocument | null =
      await this.usersRepo.findByLoginOrEmail(email);
    if (!userToSendTo) {
      throw new Error('No such email');
    }
    if (userToSendTo.confirmationData.isConfirmed) {
      throw new Error('Already confirmed');
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
    await this.mailer.sendEmailWithConfirmationCode(email, newCode, 'code');
    return true;
  }
}
