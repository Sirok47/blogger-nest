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
    let player =
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
    let newAnswer = new AnswerPSQL(answerBody, status, player, currentQuestion);
    player.answers.push(newAnswer);
    [player, newAnswer] = await Promise.all([
      this.playerRepository.save(player),
      this.answerRepository.save(newAnswer),
    ]);

    if (player.answers.length >= config.QUIZ_GAME_QUESTION_COUNT) {
      this.onPlayerFinished(player.game);
    }
    return newAnswer.mapToViewModel();
  }

  private onPlayerFinished(game: GamePSQL): void {
    const finishedPlayers: PlayerPSQL[] = game.players.filter(
      (player) => player.answers.length >= config.QUIZ_GAME_QUESTION_COUNT,
    );
    if (finishedPlayers.length === 1) {
      const correctAnswers: number = finishedPlayers[0].answers.reduce(
        (count: number, answer: AnswerPSQL): number => {
          if (answer.status) count++;
          return count;
        },
        0,
      );

      if (correctAnswers) {
        finishedPlayers[0].score++;
        void this.playerRepository.save(finishedPlayers[0]);
      }
    }
    if (finishedPlayers.length >= config.QUIZ_GAME_PLAYER_COUNT) {
      game.status = GameStatus.finished;
      game.finishedAt = new Date();
      void this.gameRepository.save(game);
    }
  }
}
