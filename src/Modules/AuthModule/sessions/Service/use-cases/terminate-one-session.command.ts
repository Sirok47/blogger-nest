import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../sessions.repository';

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
  constructor(private readonly repository: SessionRepository) {}

  async execute({ userId, deviceId }: DeleteSessionCommand): Promise<boolean> {
    const session = await this.repository.getSessionByDeviceId(deviceId);
    if (!session) {
      throw Error('Not found');
    }

    if (session.userId !== userId) {
      throw new Error('Forbidden');
    }

    return await this.repository.terminateSession(deviceId);
  }
}
