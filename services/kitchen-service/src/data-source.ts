if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { PreparedDish } from './entities/PreparedDish.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false, // ¡MUY IMPORTANTE! Nunca usar 'true' en producción. Usaremos migraciones.
    logging: false, // Muestra las consultas SQL en la consola (útil para depurar)
    entities: [PreparedDish], // Le dice a TypeORM qué entidades (tablas) manejar
    migrations: ['src/migrations/*.ts'], // Dónde encontrar los archivos de migración
});