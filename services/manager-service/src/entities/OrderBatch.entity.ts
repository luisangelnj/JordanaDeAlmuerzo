import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Definimos los posibles estados de una orden
export enum OrderStatus {
    PENDING = 'PENDING',
    PURCHASING_INGREDIENTS = 'PURCHASING_INGREDIENTS',
    PREPARING_DISHES = 'PREPARING_DISHES',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    PENDING_INGREDIENTS = 'PENDING_INGREDIENTS'
}

@Entity({ name: 'order_batches' }) // Esto le dice a TypeORM que esta clase es una tabla llamada 'order_batches'
export class OrderBatch {

    @PrimaryGeneratedColumn('uuid') // Genera un ID único universal (mejor que un número para sistemas distribuidos)
    id!: string;

    @Column({ type: 'int', generated: 'increment', unique: true })
    orderNo!: number;

    @Column({ type: 'int' })
    quantity!: number; // La cantidad de platos solicitados

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status!: OrderStatus;

    @Column()
    statusDetail!: string;

    @Column({ type: 'jsonb', nullable: true })
    preparedDishes?: any;

    @CreateDateColumn() // Columna para fecha en la que se solicitó la órden
    requestedAt!: Date;

    @CreateDateColumn() // Columna que se llena automáticamente con la fecha de creación
    createdAt!: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}