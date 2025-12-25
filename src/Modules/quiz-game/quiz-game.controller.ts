import {
  Controller,
  ForbiddenException,
  Get,
  ImATeapotException,
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

@Controller('pair-quiz-game/pairs')
export class QuizGameController {
  constructor(
    private readonly service: QuizGameService,
    private readonly queryRepo: GameQueryRepo,
    private readonly playerRepo: PlayerRepository,
  ) {}

  @Post('connection')
  @UseGuards(UserAuthGuard)
  async connectToPair(
    @Param('userId') userId: string,
  ): Promise<GameProgressViewModel> {
    const result = await this.service.JoinGame(userId);
    if (!result) {
      throw new ImATeapotException();
    }
    return result;
  }

  @Get(':id')
  @UseGuards(UserAuthGuard)
  async getGameById(
    @Param() { id }: InputID,
    @Param('userId') userId: string,
  ): Promise<GameProgressViewModel> {
    const game = await this.queryRepo.getGameProgressById(id);
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

  @Get('my-current')
  @UseGuards(UserAuthGuard)
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

  @Post('answer')
  @UseGuards(UserAuthGuard)
  async postAnswer(
    @Param('userId') userId: string,
    @Param() { answer }: AnswerInputModel,
  ): Promise<AnswerViewModel> {
    return this.service.ReceiveAnswer(userId, answer);
  }
}
