import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToPreparedDishes1750964099034 implements MigrationInterface {
    name = 'AddStatusToPreparedDishes1750964099034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."prepared_dishes_status_enum" AS ENUM('PENDING_INGREDIENTS', 'PREPARING', 'COMPLETED')`);
        await queryRunner.query(`ALTER TABLE "prepared_dishes" ADD "status" "public"."prepared_dishes_status_enum" NOT NULL DEFAULT 'PENDING_INGREDIENTS'`);
        await queryRunner.query(`ALTER TABLE "prepared_dishes" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prepared_dishes" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "prepared_dishes" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."prepared_dishes_status_enum"`);
    }

}
