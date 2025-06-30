import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCachedRecipeTable1751309461212 implements MigrationInterface {
    name = 'CreateCachedRecipeTable1751309461212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cached_recipes" ("name" character varying NOT NULL, "ingredients" jsonb NOT NULL, "lastUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f8b4676a0b8358b2b29159d8799" PRIMARY KEY ("name"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cached_recipes"`);
    }

}
