import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '../../../../Mailer/mailer.service';
import { User } from '../../../users/users.models';
import { generateUuid } from '../../../../../Helpers/uuid';
import { addOneDay } from '../../../../../Helpers/dateHelpers';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../users/Service/users.service';
import { Inject } from '@nestjs/common';

export class ResendConfirmationEmailCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailHandler
  implements ICommandHandler<ResendConfirmationEmailCommand>
{
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepo: IUsersRepository,
    private readonly mailer: MailerService,
  ) {}

  async execute({ email }: ResendConfirmationEmailCommand): Promise<boolean> {
    const userToSendTo: User | null =
      await this.usersRepo.findByLoginOrEmail(email);
    if (!userToSendTo) {
      throw new Error('No such email');
    }
    if (userToSendTo.confirmationData.isConfirmed) {
      throw new Error('Already confirmed');
    }
    const newCode = generateUuid();
    const result = await this.usersRepo.updateConfirmationCode(
      userToSendTo.id,
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
