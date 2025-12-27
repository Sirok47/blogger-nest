import { PlayerProgressViewModel } from './player.dto';
import { GameQuestionViewModel } from './question.dto';

export enum GameStatus {
  pending = 'pending',
  active = 'active',
  finished = 'finished',
}

export enum GameStatusViewModel {
  pending = 'PendingSecondPlayer',
  active = 'Active',
  finished = 'Finished',
}

export type GameProgressViewModel = {
  id: string;
  firstPlayerProgress: PlayerProgressViewModel;
  secondPlayerProgress: PlayerProgressViewModel | null;
  questions: GameQuestionViewModel[] | null;
  status: GameStatusViewModel;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
};
