import * as process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'qwerty',
  CURRENT_URL: 'localhost', //'blogger-nest-pi.vercel.app',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  PORT: process.env.PORT || 3000,
  SECRET_KEY: process.env.SECRET_KEY as string,
  MAILER_ADDRESS: process.env.MAILER_ADDR as string,
  MAILER_PASSWORD: process.env.MAILER_PASS as string,
  accessTokenLifeSpan: 10000,
  refreshTokenLifeSpan: 20000,
  COOKIE_PATH: '/',
  //PSQL
  PSQL_HOST: process.env.PSQL_HOST || 'localhost',
  PSQL_PORT: 5432,
  PSQL_USERNAME: process.env.PSQL_USERNAME,
  PSQL_PASSWORD: process.env.PSQL_PASSWORD,
  PSQL_DB: 'postgres',
  PSQL_CONNECTION_STRING: process.env.PSQL_CONNECTION_STRING,
};
