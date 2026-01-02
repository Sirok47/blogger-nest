import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionViewModel } from '../DTOs/question.dto';

@Entity({ name: 'Questions' })
export class QuestionPSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 1000 })
  body: string;

  @Column('varchar', { array: true, length: 255 })
  answers: string[];

  @Column('boolean')
  isPublished: boolean = false;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(body: string, answers: string[]) {
    this.body = body;
    this.answers = answers;
  }

  mapToViewModel(): QuestionViewModel {
    return {
      id: this.id,
      body: this.body,
      published: this.isPublished,
      correctAnswers: this.answers,
      createdAt: this.createdAt.toISOString(),
      updatedAt:
        this.updatedAt.getTime() === this.createdAt.getTime()
          ? null
          : this.updatedAt.toISOString(),
    };
  }
}
