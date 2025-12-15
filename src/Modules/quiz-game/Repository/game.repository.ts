import { Injectable } from '@nestjs/common';
import { GamePSQL, GameStatus } from '../entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(GamePSQL) private readonly repo: Repository<GamePSQL>,
  ) {}

  save(game: GamePSQL): Promise<GamePSQL> {
    return this.repo.save(game);
  }

  searchForOpenGame(): Promise<GamePSQL | null> {
    return this.repo.findOne({
      where: { status: GameStatus.pending },
      relations: ['players', 'questions'],
    });
  }

  async retrieveCurrentQuizGameOfUser(
    userId: string,
  ): Promise<GamePSQL | null> {
    return this.repo.findOne({
      relations: {
        players: true,
      },
      where: [
        {
          status: Not(GameStatus.finished),
        },
        {
          players: {
            userId: userId,
          },
        },
      ],
    });
  }
}
