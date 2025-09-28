import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshTokenGuard } from '../../../Request-Modifications/Guards/refreshToken.guard';
import { SessionViewModel, UserFromRefToken } from './sessions.models';
import { DeleteAllButOneSessionsCommand } from './Service/use-cases/terminate-all-but-one-session.command';
import { DeleteSessionCommand } from './Service/use-cases/terminate-one-session.command';
import {
  type ISessionsQueryRepo,
  SESSIONS_QUERY_REPO,
} from '../auth/Service/auth.service';
import { InputUUID } from '../../../Models/IDmodel';
import { validateOrReject } from 'class-validator';

@Controller('security/devices')
@UseGuards(RefreshTokenGuard)
export class SessionsController {
  constructor(
    @Inject(SESSIONS_QUERY_REPO)
    private readonly queryRepo: ISessionsQueryRepo,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @HttpCode(200)
  async getSessionsOfUser(
    @Param() { userId }: UserFromRefToken,
  ): Promise<SessionViewModel[]> {
    return await this.queryRepo.getSessions(userId);
  }

  @Delete()
  @HttpCode(204)
  async terminateAllOthers(
    @Param() { userId, deviceId }: UserFromRefToken,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteAllButOneSessionsCommand(userId, deviceId),
    );
  }

  @Delete('/:id')
  @HttpCode(204)
  async terminateOne(
    @Param('id') id: string,
    @Param() { userId }: UserFromRefToken,
  ): Promise<void> {
    const uuid = new InputUUID();
    uuid.id = id;
    await validateOrReject(uuid).catch((err) => {
      throw new NotFoundException(err);
    });
    if (
      !(await this.commandBus.execute(new DeleteSessionCommand(userId, id)))
    ) {
      throw new NotFoundException();
    }
  }
}
