import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedOrderBatchEntity1750734610979 implements MigrationInterface {
    name = 'UpdatedOrderBatchEntity1750734610979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_batches" ADD "requestedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_batches" DROP COLUMN "requestedAt"`);
    }

}
