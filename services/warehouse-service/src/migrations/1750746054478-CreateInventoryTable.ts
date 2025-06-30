import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInventoryTable1750746054478 implements MigrationInterface {
    name = 'CreateInventoryTable1750746054478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inventory" ("ingredientName" character varying NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_df482d1b952507d936b3b2daba9" PRIMARY KEY ("ingredientName"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "inventory"`);
    }

}
