import { IsString } from 'class-validator';

export class AnswerInputModel {
  @IsString()
  answer: string;
}

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

export class AnswerViewModel {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
}
