import { config } from 'dotenv';
import {config as conf} from './src/Settings/config';
import { DataSource } from 'typeorm';
import { UserPSQL } from './src/Modules/AuthModule/users/users.entity';
import { PlayerPSQL } from './src/Modules/quiz-game/entities/player.entity';
import { ConfirmationDataPSQL } from './src/Modules/AuthModule/users/confData.entity';
import { SessionPSQL } from './src/Modules/AuthModule/sessions/sessions.entity';
import { LikePSQL } from './src/Modules/BloggerPlatform/likes/likes.entity';
import { CommentPSQL } from './src/Modules/BloggerPlatform/comments/comments.entity';
import { PostPSQL } from './src/Modules/BloggerPlatform/posts/posts.entity';
import { BlogPSQL } from './src/Modules/BloggerPlatform/blogs/blogs.entity';
import { GamePSQL } from './src/Modules/quiz-game/entities/game.entity';
import { QuestionPSQL } from './src/Modules/quiz-game/entities/question.entity';
import { GameQuestionPSQL } from './src/Modules/quiz-game/entities/game-question.entity';
import { AnswerPSQL } from './src/Modules/quiz-game/entities/answer.entity';

config();

export default new DataSource({
  host: conf.PSQL_HOST,
  port: conf.PSQL_PORT,
  username: conf.PSQL_USERNAME,
  password: conf.PSQL_PASSWORD,
  database: conf.PSQL_DB,
  url: process.env.DATABASE_URL,
  type: 'postgres',
  migrations: ['src/migrations/*.ts'],
  //entities: ['src/**/*.entity.ts'],
  entities: [UserPSQL, PlayerPSQL, ConfirmationDataPSQL, SessionPSQL, LikePSQL, CommentPSQL, PostPSQL, BlogPSQL, GamePSQL, QuestionPSQL, GameQuestionPSQL, AnswerPSQL],
});