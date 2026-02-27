import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'host.docker.internal',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'joomla',
  password: process.env.DB_PASSWORD || 'joomla',
  database: process.env.DB_NAME || 'tc_data',
  entities: [path.resolve(__dirname, '../src/**/*.entity{.ts,.js}')],
  migrations: [path.resolve(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations_history',
  logging: true
});