import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GameQueryRepo } from './Repository/game.queryRepo';
import { QuizGameService } from './quiz-game.service';
import { GameStatus } from './DTOs/game.dto';
import { config } from '../../Settings/config';
import { AnswerPSQL } from './entities/answer.entity';

@Processor('GameCleaner')
export class GameCleanerService extends WorkerHost {
  constructor(
    private readonly gameService: QuizGameService,
    private readonly gameQueryRepo: GameQueryRepo,
  ) {
    super();
  }
  async process(job: Job): Promise<boolean> {
    try {
      const game = await this.gameQueryRepo.getGameProgressById(
        job.data.gameId,
        true,
      );
      if (!game) {
        console.error('No game found with ID: ' + job.data.gameId);
        return false;
      }
      if (game.status === GameStatus.finished) {
        return true;
      }
      for (const player of game.players) {
        while (player.answers.length < config.QUIZ_GAME_QUESTION_COUNT) {
          const answer = new AnswerPSQL(
            'Out of time',
            false,
            player,
            game.questions[player.answers.length].question,
          );
          player.answers.push(answer);
        }
      }
      await this.gameService.onGameFinished(game);
    } catch (e) {
      console.error(e);
    }
    return true;
  }
}
