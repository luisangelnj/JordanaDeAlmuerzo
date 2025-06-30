import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPreparedDishesToOrderBatch1751251877343 implements MigrationInterface {
    name = 'AddedPreparedDishesToOrderBatch1751251877343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_batches" ADD "preparedDishes" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_batches" DROP COLUMN "preparedDishes"`);
    }

}
