import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedFolioToPurchaseHistory1751302738400 implements MigrationInterface {
    name = 'AddedFolioToPurchaseHistory1751302738400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_history" ADD "folio" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_history" ADD CONSTRAINT "UQ_5851d8ac7354285ae60b4e8b00b" UNIQUE ("folio")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_history" DROP CONSTRAINT "UQ_5851d8ac7354285ae60b4e8b00b"`);
        await queryRunner.query(`ALTER TABLE "purchase_history" DROP COLUMN "folio"`);
    }

}
