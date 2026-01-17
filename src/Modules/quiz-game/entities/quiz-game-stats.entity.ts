import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerPSQL } from './player.entity';
import { PlayerResult } from '../DTOs/player.dto';
import { UserPSQL } from '../../AuthModule/users/users.entity';
import {
  QuizGameStatsViewModel,
  QuizGameStatsWithUserViewModel,
} from '../DTOs/stats.dto';

@Entity({ name: 'QuizGameStats' })
export class QuizGameStatsPSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('integer')
  sumScore: number = 0;

  @Column('decimal', { scale: 2 })
  avgScores: number = 0;

  @Column('integer')
  gamesCount: number = 0;

  @Column('integer')
  winsCount: number = 0;

  @Column('integer')
  lossesCount: number = 0;

  @Column('integer')
  drawsCount: number = 0;

  @OneToOne(() => UserPSQL, (user) => user.quizGameStats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserPSQL;
  @Column()
  userId: string;

  constructor(userId: string, players: PlayerPSQL[]) {
    this.userId = userId;
    if (!players) {
      return;
    }
    this.gamesCount = players.length;
    for (const player of players) {
      this.sumScore += player.score;
      switch (player.result) {
        case PlayerResult.victory:
          this.winsCount++;
          break;
        case PlayerResult.loss:
          this.lossesCount++;
          break;
        case PlayerResult.draw:
          this.drawsCount++;
      }
    }
    this.avgScores = Math.ceil((this.sumScore / this.gamesCount) * 100) / 100;
  }

  updateStats(player: PlayerPSQL): this {
    this.sumScore += player.score;
    this.gamesCount++;
    this.avgScores = Math.ceil((this.sumScore / this.gamesCount) * 100) / 100;
    switch (player.result) {
      case PlayerResult.victory:
        this.winsCount++;
        break;
      case PlayerResult.loss:
        this.lossesCount++;
        break;
      case PlayerResult.draw:
        this.drawsCount++;
    }
    return this;
  }

  mapToViewModel(): QuizGameStatsViewModel {
    return {
      avgScores: +this.avgScores,
      gamesCount: this.gamesCount,
      sumScore: this.sumScore,
      winsCount: this.winsCount,
      lossesCount: this.lossesCount,
      drawsCount: this.drawsCount,
    };
  }

  mapToViewModelWithUser(): QuizGameStatsWithUserViewModel {
    return {
      ...this.mapToViewModel(),
      player: {
        id: this.user.id,
        login: this.user.login,
      },
    };
  }
}
