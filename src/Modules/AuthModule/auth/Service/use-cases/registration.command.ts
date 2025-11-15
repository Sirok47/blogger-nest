import { UserDocument, UserInputModel } from '../../../users/users.models';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '../../../../Mailer/mailer.service';
import { CreateUserCommand } from '../../../users/Service/use-cases/createUserCommand';

export class RegisterUserCommand {
  constructor(public readonly user: UserInputModel) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mailer: MailerService,
  ) {}

  async execute({ user }: RegisterUserCommand): Promise<boolean> {
    const uuid: string = (
      await this.commandBus.execute<CreateUserCommand, UserDocument>(
        new CreateUserCommand(user),
      )
    ).confirmationData.confirmationCode;

    await this.mailer.sendEmailWithConfirmationCode(user.email, uuid, 'code');

    return true;
  }
}
