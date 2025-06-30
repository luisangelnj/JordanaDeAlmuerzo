if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Inventory } from './entities/Inventory.entity';
import { IngredientRequest } from './entities/IngredientRequest.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false, // Nunca usar 'true' en producción. Usaremos migraciones.
    logging: false, // Muestra las consultas SQL en la consola (Para depuración)
    entities: [Inventory, IngredientRequest], // Estas son entidades que TypeORM manejará
    migrations: ['src/migrations/*.ts'], // Dónde encontrar los archivos de migración
});