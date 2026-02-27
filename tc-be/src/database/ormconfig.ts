import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const config: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST || 'host.docker.internal',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'joomla',
    password: process.env.DB_PASSWORD || 'joomla',
    database: process.env.DB_NAME || 'tc_data',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development'
};