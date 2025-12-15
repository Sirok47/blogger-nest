import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerPSQL } from './player.entity';
import { GameQuestionPSQL } from './game-question.entity';
import { GameProgressViewModel } from '../DTOs/game.dto';
import { QuestionPSQL } from './question.entity';

export enum GameStatus {
  pending = 'pending',
  active = 'active',
  finished = 'finished',
}

@Entity({ name: 'Games' })
export class GamePSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('enum', { enum: GameStatus })
  status: GameStatus = GameStatus.pending;

  @CreateDateColumn()
  createdAt: Date;
  @Column('timestamp with time zone', { nullable: true })
  startedAt: Date | null = null;
  @Column('timestamp with time zone', { nullable: true })
  finishedAt: Date | null = null;

  @OneToMany(() => GameQuestionPSQL, (gameQ) => gameQ.game, {
    cascade: true,
    eager: true,
  })
  questions: GameQuestionPSQL[];

  @OneToMany(() => PlayerPSQL, (player) => player.game, {
    cascade: true,
    eager: true,
  })
  players: PlayerPSQL[] = [];

  constructor(questions: QuestionPSQL[]) {
    this.questions = [];
    for (const question of questions) {
      const gq = new GameQuestionPSQL(question);
      this.questions.push(gq);
    }
  }

  mapToViewModel(): GameProgressViewModel {
    return {
      id: this.id,
      pairCreatedDate: this.createdAt.toISOString(),
      startGameDate: this.startedAt?.toISOString() ?? null,
      finishGameDate: this.finishedAt?.toISOString() ?? null,
      status: this.status,
      questions:
        this.status === GameStatus.pending
          ? null
          : this.questions.map((question) => question.mapToViewModel()),
      firstPlayerProgress: this.players[0].mapToViewModel(),
      secondPlayerProgress: this.players[1]?.mapToViewModel() ?? null,
    };
  }
}
