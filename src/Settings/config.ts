import * as process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'qwerty',
  CURRENT_URL: process.env.CURRENT_URL,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  PORT: process.env.PORT || 3000,
  SECRET_KEY: process.env.SECRET_KEY as string,
  MAILER_ADDRESS: process.env.MAILER_ADDR as string,
  MAILER_PASSWORD: process.env.MAILER_PASS as string,
  accessTokenLifeSpan: +(process.env.ACC_TOKEN_LIFESPAN as string),
  refreshTokenLifeSpan: +(process.env.REF_TOKEN_LIFESPAN as string),
  COOKIE_PATH: '/',
  //PSQL
  PSQL_HOST: process.env.PSQL_HOST || 'localhost',
  PSQL_PORT: 5432,
  PSQL_USERNAME: process.env.PSQL_USERNAME,
  PSQL_PASSWORD: process.env.PSQL_PASSWORD,
  PSQL_DB: 'postgres1',
  PSQL_CONNECTION_STRING: process.env.PSQL_CONNECTION_STRING,
  //QUIZ_GAME
  QUIZ_GAME_PLAYER_COUNT: 2,
  QUIZ_GAME_QUESTION_COUNT: 5,
};
