import { AnswerViewModel } from './answer.dto';
import { PlayerPSQL } from '../entities/player.entity';

export type PlayerProgressViewModel = {
  answers: AnswerViewModel[];
  player: {
    id: string;
    login: string;
  };
  score: number;
};

export enum PlayerResult {
  victory = 'victory',
  loss = 'loss',
  draw = 'draw',
}

export class PlayerStats {
  sumScore: number = 0;
  avgScores: number = 0;
  gamesCount: number = 0;
  winsCount: number = 0;
  lossesCount: number = 0;
  drawsCount: number = 0;

  calculateStats(players: PlayerPSQL[]): void {
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
}
