import { AnswerViewModel } from './answer.dto';

export class PlayerProgressViewModel {
  answers: AnswerViewModel[];
  player: {
    id: string;
    login: string;
  };
  score: number;
}
