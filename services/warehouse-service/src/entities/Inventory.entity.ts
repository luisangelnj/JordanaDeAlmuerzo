import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'inventory' })
export class Inventory {
    @PrimaryColumn()
    ingredientName!: string;

    @Column({ type: 'int' })
    quantity!: number;
}