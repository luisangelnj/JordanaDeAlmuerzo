// services/manager-service/src/entities/CachedRecipe.entity.ts
import { Entity, PrimaryColumn, Column, UpdateDateColumn } from "typeorm";

@Entity({ name: 'cached_recipes' })
export class CachedRecipe {
    @PrimaryColumn()
    name!: string;

    @Column({ type: 'jsonb' })
    ingredients!: object[];

    @UpdateDateColumn()
    lastUpdatedAt!: Date;
}