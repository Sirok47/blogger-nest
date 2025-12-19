import { config } from 'dotenv';
import {config as conf} from 'src/Settings/config';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
  host: conf.PSQL_HOST,
  port: conf.PSQL_PORT,
  username: conf.PSQL_USERNAME,
  password: conf.PSQL_PASSWORD,
  database: conf.PSQL_DB,
  url: process.env.DATABASE_URL,
  type: 'postgres',
  migrations: ['migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
});