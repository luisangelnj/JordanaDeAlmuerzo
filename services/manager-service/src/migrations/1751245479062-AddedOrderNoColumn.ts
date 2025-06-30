import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedOrderNoColumn1751245479062 implements MigrationInterface {
    name = 'AddedOrderNoColumn1751245479062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_batches" ADD "orderNo" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_batches" ADD CONSTRAINT "UQ_1f7287522daba714f95e4158299" UNIQUE ("orderNo")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_batches" DROP CONSTRAINT "UQ_1f7287522daba714f95e4158299"`);
        await queryRunner.query(`ALTER TABLE "order_batches" DROP COLUMN "orderNo"`);
    }

}
