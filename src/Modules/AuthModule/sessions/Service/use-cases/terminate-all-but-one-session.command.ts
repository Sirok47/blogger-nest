import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  type ISessionsRepository,
  SESSIONS_REPOSITORY,
} from '../../../auth/Service/auth.service';
import { Inject } from '@nestjs/common';

export class DeleteAllButOneSessionsCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteAllButOneSessionsCommand)
export class DeleteAllButOneSessionsHandler
  implements ICommandHandler<DeleteAllButOneSessionsCommand>
{
  constructor(
    @Inject(SESSIONS_REPOSITORY)
    private readonly repository: ISessionsRepository,
  ) {}

  async execute({
    userId,
    deviceId,
  }: DeleteAllButOneSessionsCommand): Promise<boolean> {
    return await this.repository.terminateAllButOne(userId, deviceId);
  }
}
