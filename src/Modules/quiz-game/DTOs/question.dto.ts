import { IsString, Length } from 'class-validator';

export class QuestionInputModel {
  @IsString()
  @Length(10, 500)
  body: string;

  @IsString({ each: true })
  correctAnswers: string[];
}

export type QuestionViewModel = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string | null;
};
