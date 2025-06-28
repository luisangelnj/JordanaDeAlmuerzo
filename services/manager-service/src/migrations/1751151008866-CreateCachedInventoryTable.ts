import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCachedInventoryTable1751151008866 implements MigrationInterface {
    name = 'CreateCachedInventoryTable1751151008866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cached_inventory" ("ingredientName" character varying NOT NULL, "quantity" integer NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_681660dda0c93102dbfc3d12581" PRIMARY KEY ("ingredientName"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cached_inventory"`);
    }

}
