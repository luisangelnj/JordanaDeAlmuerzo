// services/manager-service/src/entities/CachedInventory.entity.ts
import { Entity, PrimaryColumn, Column, UpdateDateColumn } from "typeorm";

@Entity({ name: 'cached_inventory' })
export class CachedInventory {
    @PrimaryColumn()
    ingredientName!: string;

    @Column({ type: 'int' })
    quantity!: number;

    @UpdateDateColumn()
    updatedAt!: Date;
}