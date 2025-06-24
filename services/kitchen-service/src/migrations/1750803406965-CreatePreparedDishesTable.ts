import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePreparedDishesTable1750803406965 implements MigrationInterface {
    name = 'CreatePreparedDishesTable1750803406965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "prepared_dishes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dishName" character varying(255) NOT NULL, "batchId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_beb080a6e2fbc04735cb3b1e4e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b35dd54842759267281ca56676" ON "prepared_dishes" ("batchId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b35dd54842759267281ca56676"`);
        await queryRunner.query(`DROP TABLE "prepared_dishes"`);
    }

}
