import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import {
  type ISessionsRepository,
  SESSIONS_REPOSITORY,
} from '../../../auth/Service/auth.service';

export class DeleteSessionCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionHandler
  implements ICommandHandler<DeleteSessionCommand>
{
  constructor(
    @Inject(SESSIONS_REPOSITORY)
    private readonly repository: ISessionsRepository,
  ) {}

  async execute({ userId, deviceId }: DeleteSessionCommand): Promise<boolean> {
    const session = await this.repository.getSessionByDeviceId(deviceId);

    if (!session) {
      throw new NotFoundException();
    }
    if (session.userId !== userId) {
      throw new ForbiddenException();
    }

    return await this.repository.terminateSession(deviceId);
  }
}
