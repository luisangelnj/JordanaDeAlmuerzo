import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePurchaseHistoryTable1751230944622 implements MigrationInterface {
    name = 'CreatePurchaseHistoryTable1751230944622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ingredientName" character varying NOT NULL, "quantityBought" integer NOT NULL, "purchasedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e5426ccc10998593a2714764ec6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "purchase_history"`);
    }

}
