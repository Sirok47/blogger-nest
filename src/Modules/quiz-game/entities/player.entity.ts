import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserPSQL } from '../../AuthModule/users/users.entity';
import { AnswerPSQL } from './answer.entity';
import { GamePSQL } from './game.entity';
import { PlayerProgressViewModel, PlayerResult } from '../DTOs/player.dto';

@Entity({ name: 'Players' })
export class PlayerPSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserPSQL, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: UserPSQL;
  @Column()
  userId: string;

  @Column('integer')
  score: number = 0;

  @Column('enum', { enum: PlayerResult, nullable: true, default: 'NULL' })
  result: PlayerResult | null;

  @Column('boolean')
  bonusForFirst: boolean = false;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => GamePSQL, (gamePSQL) => gamePSQL.players, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  game: GamePSQL;
  @Column()
  gameId: string;

  @OneToMany(() => AnswerPSQL, (answer) => answer.player)
  answers: AnswerPSQL[];

  constructor(user: UserPSQL) {
    this.user = user;
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
