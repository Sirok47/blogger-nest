import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../sessions.repository';

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
  constructor(private readonly repository: SessionRepository) {}

  async execute({
    userId,
    deviceId,
  }: DeleteAllButOneSessionsCommand): Promise<boolean> {
    return await this.repository.terminateAllButOne(userId, deviceId);
  }
}
