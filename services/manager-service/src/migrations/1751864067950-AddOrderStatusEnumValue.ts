import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStatusEnumValue1751864067950 implements MigrationInterface {
    name = 'AddOrderStatusEnumValue1751864067950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."order_batches_status_enum" RENAME TO "order_batches_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_batches_status_enum" AS ENUM('PENDING', 'PURCHASING_INGREDIENTS', 'PREPARING_DISHES', 'COMPLETED', 'FAILED', 'PENDING_INGREDIENTS')`);
        await queryRunner.query(`ALTER TABLE "order_batches" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_batches" ALTER COLUMN "status" TYPE "public"."order_batches_status_enum" USING "status"::"text"::"public"."order_batches_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_batches" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."order_batches_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_batches_status_enum_old" AS ENUM('PENDING', 'PURCHASING_INGREDIENTS', 'PREPARING_DISHES', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "order_batches" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_batches" ALTER COLUMN "status" TYPE "public"."order_batches_status_enum_old" USING "status"::"text"::"public"."order_batches_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order_batches" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."order_batches_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_batches_status_enum_old" RENAME TO "order_batches_status_enum"`);
    }

}
