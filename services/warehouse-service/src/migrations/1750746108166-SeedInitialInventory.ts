import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedInitialInventory1750746108166 implements MigrationInterface {
    name = 'SeedInitialInventory1750746108166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Lista de ingredientes iniciales
        const ingredients = [
            "tomato", "lemon", "potato", "rice", "ketchup", 
            "lettuce", "onion", "cheese", "meat", "chicken"
        ];

        console.log("Seeding initial inventory...");

        // Insertar cada ingrediente con una cantidad inicial de 5
        for (const ingredient of ingredients) {
            await queryRunner.query(
                `INSERT INTO "inventory" ("ingredientName", "quantity") VALUES ($1, $2)`,
                [ingredient, 5]
            );
        }

        console.log("Initial inventory seeded successfully.");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // El método 'down' revierte los cambios, eliminando los datos que insertamos.
        // Esto es útil si necesitas deshacer la migración.
        const ingredients = [
            "Tomato", "Lemon", "Potato", "Rice", "Ketchup", 
            "Lettuce", "Onion", "Cheese", "Meat", "Chicken"
        ];

        console.log("Reverting initial inventory seed...");

        // Elimina los ingredientes de la lista.
        // Usamos IN para hacerlo en una sola consulta para mayor eficiencia.
        await queryRunner.query(
            `DELETE FROM "inventory" WHERE "ingredientName" IN ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            ingredients
        );
        
        console.log("Initial inventory seed reverted.");
    }

}
