import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerPSQL } from './player.entity';
import { QuestionPSQL } from './question.entity';
import { AnswerStatus, AnswerViewModel } from '../DTOs/answer.dto';

@Entity({ name: 'Answers' })
export class AnswerPSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  body: string;

  @Column('boolean')
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => PlayerPSQL, (player) => player.answers)
  player: PlayerPSQL;
  @Column()
  playerId: string;

  @ManyToOne(() => QuestionPSQL)
  question: QuestionPSQL;
  @Column()
  questionId: string;

  constructor(
    body: string,
    status: boolean,
    player: PlayerPSQL,
    question: QuestionPSQL,
  ) {
    this.body = body;
    this.status = status;
    this.player = player;
    this.question = question;
  }

  mapToViewModel(): AnswerViewModel {
    return {
      questionId: this.questionId,
      answerStatus: this.status ? AnswerStatus.Correct : AnswerStatus.Incorrect,
      addedAt: this.createdAt.toISOString(),
    };
  }
}
