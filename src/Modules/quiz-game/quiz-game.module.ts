import { Module } from '@nestjs/common';
import { GameRepository } from './Repository/game.repository';
import { QuizGameService } from './quiz-game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamePSQL } from './entities/game.entity';
import { PlayerPSQL } from './entities/player.entity';
import { AnswerPSQL } from './entities/answer.entity';
import { QuestionPSQL } from './entities/question.entity';
import { GameQuestionPSQL } from './entities/game-question.entity';
import { GameQueryRepo } from './Repository/game.queryRepo';
import { AuthModule } from '../AuthModule/auth.module';
import { QuizGameController } from './quiz-game.controller';
import { AnswerRepository } from './Repository/answer.repository';
import { PlayerRepository } from './Repository/player.repository';
import { QuestionRepository } from './Repository/question.repository';
import { QuestionController } from './question.controller';
import { QuestionQueryRepo } from './Repository/question.queryRepo';
import { QuestionService } from './question.service';
import { TokenModule } from '../JWT/jwt.module';
import { QuizGameStatsRepository } from './Repository/quiz-game-stats.repository';
import { QuizGameStatsQueryRepo } from './Repository/quiz-game-stats.queryRepo';
import { QuizGameStatsPSQL } from './entities/quiz-game-stats.entity';

@Module({
  imports: [
    TokenModule,
    AuthModule,
    TypeOrmModule.forFeature([
      GamePSQL,
      PlayerPSQL,
      AnswerPSQL,
      QuestionPSQL,
      GameQuestionPSQL,
      QuizGameStatsPSQL,
    ]),
  ],
  controllers: [QuizGameController, QuestionController],
  providers: [
    GameRepository,
    AnswerRepository,
    PlayerRepository,
    QuestionRepository,
    QuestionQueryRepo,
    GameQueryRepo,
    QuizGameService,
    QuestionService,
    QuizGameStatsRepository,
    QuizGameStatsQueryRepo,
  ],
  exports: [
    GameRepository,
    AnswerRepository,
    PlayerRepository,
    QuestionRepository,
  ],
})
export class QuizGameModule {}
