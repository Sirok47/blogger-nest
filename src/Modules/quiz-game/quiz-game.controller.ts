import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QuizGameService } from './quiz-game.service';
import { GameProgressViewModel } from './DTOs/game.dto';
import { UserAuthGuard } from '../../Request-Modifications/Guards/accessToken.guard';
import { GameQueryRepo } from './Repository/game.queryRepo';
import { InputID } from '../../Models/IDmodel';
import { PlayerRepository } from './Repository/player.repository';
import { AnswerInputModel, AnswerViewModel } from './DTOs/answer.dto';
import { OptionalAccessTokenGuardGuard } from '../../Request-Modifications/Guards/optionalAccessToken.guard';

@Controller('pair-game-quiz/pairs')
export class QuizGameController {
  constructor(
    private readonly service: QuizGameService,
    private readonly queryRepo: GameQueryRepo,
    private readonly playerRepo: PlayerRepository,
  ) {}

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserAuthGuard, OptionalAccessTokenGuardGuard)
  async connectToPair(
    @Param('userId') userId: string,
  ): Promise<GameProgressViewModel> {
    return await this.service.JoinGame(userId);
  }

  @Get('my-current')
  @UseGuards(UserAuthGuard, OptionalAccessTokenGuardGuard)
  async getCurrentGame(
    @Param('userId') userId: string,
  ): Promise<GameProgressViewModel> {
    const player = await this.playerRepo.getActiveOfUser(userId);
    if (!player) {
      throw new NotFoundException();
    }
    const game = await this.queryRepo.getGameProgressById(player.gameId);
    if (!game) {
      throw new NotFoundException();
    }
    return game.mapToViewModel();
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserAuthGuard, OptionalAccessTokenGuardGuard)
  async postAnswer(
    @Param('userId') userId: string,
    @Body() { answer }: AnswerInputModel,
  ): Promise<AnswerViewModel> {
    return this.service.ReceiveAnswer(userId, answer);
  }

  @Get(':id')
  @UseGuards(UserAuthGuard, OptionalAccessTokenGuardGuard)
  async getGameById(
    @Param() { id }: InputID,
    @Param('userId') userId: string,
  ): Promise<GameProgressViewModel> {
    const game = await this.queryRepo.getGameProgressById(id, true);
    if (!game) {
      throw new NotFoundException();
    }

    let hasPermission: boolean = false;
    for (const player of game.players) {
      if (player.userId === userId) hasPermission = true;
    }
    if (!hasPermission) {
      throw new ForbiddenException();
    }

    return game.mapToViewModel();
  }
}
