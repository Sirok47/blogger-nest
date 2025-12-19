import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GamePSQL } from './game.entity';
import { QuestionPSQL } from './question.entity';
import { GameQuestionViewModel, QuestionViewModel } from '../DTOs/question.dto';

@Entity({ name: 'GameQuestions' })
export class GameQuestionPSQL {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => GamePSQL)
  game: GamePSQL;
  @Column()
  gameId: string;

  @ManyToOne(() => QuestionPSQL, { eager: true })
  question: QuestionPSQL;
  @Column()
  questionId: string;

  constructor(question: QuestionPSQL) {
    this.question = question;
  }

  mapToViewModel(): GameQuestionViewModel {
    return {
      id: this.id.toString(),
      body: this.question.body,
    };
  }
}
