import { IsBoolean, IsString, Length } from 'class-validator';

export class InputPublishedStatus {
  @IsBoolean()
  status: boolean;
}

export class QuestionInputModel {
  @IsString()
  @Length(10, 500)
  body: string;

  @IsString({ each: true })
  correctAnswers: string[];
}

export type GameQuestionViewModel = {
  id: string;
  body: string;
};

export type QuestionViewModel = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string | null;
};
