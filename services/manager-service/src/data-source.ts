import 'reflect-metadata';
import { DataSource } from 'typeorm';

import * as entities from './entities';
import * as migrations from './migrations';

export const AppDataSource = new DataSource({
    type: 'postgres',

    url: process.env.MANAGER_DATABASE_URL,

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

    synchronize: false, // ¡MUY IMPORTANTE! Nunca usar 'true' en producción. Usaremos migraciones.
    logging: process.env.NODE_ENV !== 'production',
    entities: Object.values(entities),
    migrations: Object.values(migrations),
});