import 'reflect-metadata';
import { DataSource } from 'typeorm';

import * as entities from './entities';
import * as migrations from './migrations';

function isTypeOrmLoggingEnabled() {
  const isProd = process.env.NODE_ENV === 'production';
  const envVar = process.env.TYPEORM_LOGGING?.toLowerCase();
  return !isProd && envVar !== 'false';
}

export const AppDataSource = new DataSource({
    type: 'postgres',

    url: process.env.WAREHOUSE_DATABASE_URL,

    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    extra: {
        family: 4 // Forza el uso de IPv4
    },

    ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,

    synchronize: false, // Nunca usar 'true' en producción. Usaremos migraciones.
    logging: isTypeOrmLoggingEnabled(),
    entities: Object.values(entities),
    migrations: Object.values(migrations),
});