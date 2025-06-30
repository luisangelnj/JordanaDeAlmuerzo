import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1751244073959 implements MigrationInterface {
    name = 'InitialSchema1751244073959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_batches_status_enum" AS ENUM('PENDING', 'PURCHASING_INGREDIENTS', 'PREPARING_DISHES', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "order_batches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "status" "public"."order_batches_status_enum" NOT NULL DEFAULT 'PENDING', "statusDetail" character varying NOT NULL, "requestedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_2b6b9ed5fdd6411e9f9c1d727f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cached_inventory" ("ingredientName" character varying NOT NULL, "quantity" integer NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_681660dda0c93102dbfc3d12581" PRIMARY KEY ("ingredientName"))`);
        await queryRunner.query(`CREATE TABLE "purchase_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ingredientName" character varying NOT NULL, "quantityBought" integer NOT NULL, "purchasedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e5426ccc10998593a2714764ec6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "purchase_history"`);
        await queryRunner.query(`DROP TABLE "cached_inventory"`);
        await queryRunner.query(`DROP TABLE "order_batches"`);
        await queryRunner.query(`DROP TYPE "public"."order_batches_status_enum"`);
    }

}
