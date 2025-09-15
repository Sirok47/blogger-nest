import * as process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'qwerty',
  CURRENT_URL: 'blogger-nest-pi.vercel.app',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  PORT: process.env.PORT || 3000,
  SECRET_KEY: process.env.SECRET_KEY as string,
  MAILER_ADDRESS: process.env.MAILER_ADDR as string,
  MAILER_PASSWORD: process.env.MAILER_PASS as string,
  accessTokenLifeSpan: 10,
  refreshTokenLifeSpan: 20,
  COOKIE_PATH: '/',
};
