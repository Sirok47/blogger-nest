import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GameRepository } from './Repository/game.repository';
import { GamePSQL, GameStatus } from './entities/game.entity';
import { UserPSQL } from '../AuthModule/users/users.models';
import { UsersRepositoryPSQL } from '../AuthModule/users/Repository/PostgreSQL/users.repository.psql';
import { PlayerPSQL } from './entities/player.entity';
import { QuestionRepository } from './Repository/question.repository';
import { GameQueryRepo } from './Repository/game.queryRepo';
import { GameProgressViewModel } from './DTOs/game.dto';
import { AnswerViewModel } from './DTOs/answer.dto';
import { PlayerRepository } from './Repository/player.repository';
import { config } from '../../Settings/config';
import { AnswerPSQL } from './entities/answer.entity';
import { AnswerRepository } from './Repository/answer.repository';

@Injectable()
export class QuizGameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly gameQueryRepo: GameQueryRepo,
    private readonly userRepository: UsersRepositoryPSQL,
    private readonly questionRepository: QuestionRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly answerRepository: AnswerRepository,
  ) {}

  async JoinGame(userId: string): Promise<GameProgressViewModel | null> {
    const hasGames: boolean =
      !!(await this.gameRepository.retrieveCurrentQuizGameOfUser(userId));
    if (hasGames) {
      throw new ForbiddenException();
    }
    let game: GamePSQL | null = await this.gameRepository.searchForOpenGame();
    if (!game) {
      game = new GamePSQL(
        await this.questionRepository.retrieveRandomQuestions(
          config.QUIZ_GAME_QUESTION_COUNT,
        ),
      );
    }
    const user: UserPSQL | null = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const player = new PlayerPSQL(user, game);
    game.players.push(player);
    if (game.players.length >= config.QUIZ_GAME_PLAYER_COUNT) {
      game.status = GameStatus.active;
      game.startedAt = new Date();
    }
    game = await this.gameRepository.save(game);
    return (await this.gameQueryRepo.getGameProgressById(
      game.id,
    ))!.mapToViewModel();
  }

  async receiveAnswer(
    userId: string,
    answerBody: string,
  ): Promise<AnswerViewModel> {
    const player =
      await this.playerRepository.getActiveOfUserWithRelations(userId);
    if (!player || player.answers.length >= config.QUIZ_GAME_QUESTION_COUNT) {
      throw new ForbiddenException();
    }
    const currentQuestion =
      player.game.questions[player.answers.length - 1].question;
    const status: boolean = currentQuestion.answers.indexOf(answerBody) >= 0;
    if (status) {
      player.score++;
    }
    const newAnswer = new AnswerPSQL(
      answerBody,
      status,
      player,
      currentQuestion,
    );
    return (await this.answerRepository.save(newAnswer)).mapToViewModel();
  }
}
