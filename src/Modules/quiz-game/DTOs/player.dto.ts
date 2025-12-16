import { AnswerViewModel } from './answer.dto';

export type PlayerProgressViewModel = {
  answers: AnswerViewModel[];
  player: {
    id: string;
    login: string;
  };
  score: number;
};
