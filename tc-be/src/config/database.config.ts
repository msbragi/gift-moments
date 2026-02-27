import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (config: ConfigService): TypeOrmModuleOptions => {
    const dbType = config.get('DB_TYPE', 'sqlite');
    
    // Common configuration
    const commonConfig = {
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        //synchronize: config.get('NODE_ENV', 'development') === 'development',
        synchronize: false, // Disable auto-sync always
        logging: config.get('NODE_ENV', 'development') === 'development',
    };

    switch (dbType.toLowerCase()) {
        case 'sqlite':
            return {
                type: 'sqlite',
                database: config.get('SQLITE_DB_PATH', 'data/time-capsule.db'),
                ...commonConfig,
            };
        case 'mysql':
        case 'mariadb':
            const type = dbType.toLowerCase() === 'mysql' ? 'mysql' : 'mariadb'; 
            return {
                type: type,
                host: config.get('MYSQL_HOST', 'localhost'),
                port: config.get('MYSQL_PORT', 3306),
                username: config.get('MYSQL_USERNAME', 'tc_user'),
                password: config.get('MYSQL_PASSWORD', 'tc_password'),
                database: config.get('MYSQL_DATABASE', 'time_capsule'),
                charset: config.get('MYSQL_CHARSET', 'utf8mb4'),
                timezone: config.get('MYSQL_TIMEZONE', '+00:00'),
                ssl: config.get('NODE_ENV', 'development') === 'production',
                ...commonConfig,
            };

        case 'pgsql':
        case 'postgres':
        case 'postgresql':
            return {
                type: 'postgres',
                host: config.get('PGSQL_HOST', 'localhost'),
                port: config.get('PGSQL_PORT', 5432),
                username: config.get('PGSQL_USERNAME', 'tc_user'),
                password: config.get('PGSQL_PASSWORD', 'tc_password'),
                database: config.get('PGSQL_DATABASE', 'time_capsule'),
                schema: config.get('PGSQL_SCHEMA', 'time_capsule_schema'),
                ssl: config.get('PGSQL_SSL', 'false') === 'true',
                ...commonConfig,
            };

        default:
            throw new Error(`Unsupported database type: ${dbType}. Supported types: sqlite, mysql, postgres`);
    }
};