import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: 'purchase_history' })
export class PurchaseHistory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    ingredientName!: string;

    @Column({ type: 'int' })
    quantityBought!: number;

    @CreateDateColumn()
    purchasedAt!: Date;
}