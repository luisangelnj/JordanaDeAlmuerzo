import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1750727942991 implements MigrationInterface {
    name = 'InitialSchema1750727942991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_batches_status_enum" AS ENUM('PENDING', 'PREPARING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "order_batches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "status" "public"."order_batches_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2b6b9ed5fdd6411e9f9c1d727f3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "order_batches"`);
        await queryRunner.query(`DROP TYPE "public"."order_batches_status_enum"`);
    }

}
