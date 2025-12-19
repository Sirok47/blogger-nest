import { GameStatus } from '../entities/game.entity';
import { PlayerProgressViewModel } from './player.dto';
import { GameQuestionViewModel } from './question.dto';

export type GameProgressViewModel = {
  id: string;
  firstPlayerProgress: PlayerProgressViewModel;
  secondPlayerProgress: PlayerProgressViewModel | null;
  questions: GameQuestionViewModel[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
};
