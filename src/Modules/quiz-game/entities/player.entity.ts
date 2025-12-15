import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserPSQL } from '../../AuthModule/users/users.models';
import { AnswerPSQL } from './answer.entity';
import { GamePSQL } from './game.entity';
import { PlayerProgressViewModel } from '../DTOs/player.dto';

@Entity({ name: 'Players' })
export class PlayerPSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserPSQL)
  user: UserPSQL;
  @Column()
  userId: string;

  @Column('integer')
  score: number = 0;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => GamePSQL, (gamePSQL) => gamePSQL.players)
  game: GamePSQL;
  @Column()
  gameId: string;

  @OneToMany(() => AnswerPSQL, (answer) => answer.player)
  answers: AnswerPSQL[] = [];

  constructor(user: UserPSQL, game: GamePSQL) {
    this.user = user;
    this.game = game;
  }

  mapToViewModel(): PlayerProgressViewModel {
    return {
      score: this.score,
      player: {
        id: this.user.id,
        login: this.user.login,
      },
      answers: this.answers.map((answer) => answer.mapToViewModel()),
    };
  }
}
