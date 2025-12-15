import { GameStatus } from '../entities/game.entity';
import { PlayerProgressViewModel } from './player.dto';
import { QuestionViewModel } from './question.dto';

export type GameProgressViewModel = {
  id: string;
  firstPlayerProgress: PlayerProgressViewModel;
  secondPlayerProgress: PlayerProgressViewModel | null;
  questions: QuestionViewModel[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
};
