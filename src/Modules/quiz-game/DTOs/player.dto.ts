import { AnswerViewModel } from './answer.dto';
import { QuizGameStatsPSQL } from '../entities/quiz-game-stats.entity';

export type PlayerProgressViewModel = {
  answers: AnswerViewModel[];
  player: {
    id: string;
    login: string;
  };
  score: number;
};

export enum PlayerResult {
  victory = 'victory',
  loss = 'loss',
  draw = 'draw',
}
