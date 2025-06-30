import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIngredientRequestTable1750816483028 implements MigrationInterface {
    name = 'CreateIngredientRequestTable1750816483028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ingredient_requests_status_enum" AS ENUM('PENDING_PURCHASE', 'READY_TO_PREPARE', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "ingredient_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "batchId" uuid NOT NULL, "status" "public"."ingredient_requests_status_enum" NOT NULL, "requestedIngredients" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b28f3454ebb2d972f9e60494071" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_54663a998e4ee85f1f185aa62d" ON "ingredient_requests" ("batchId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_54663a998e4ee85f1f185aa62d"`);
        await queryRunner.query(`DROP TABLE "ingredient_requests"`);
        await queryRunner.query(`DROP TYPE "public"."ingredient_requests_status_enum"`);
    }

}
