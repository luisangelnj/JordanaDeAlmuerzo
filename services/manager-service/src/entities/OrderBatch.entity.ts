import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// Definimos los posibles estados de una orden
export enum OrderStatus {
    PENDING = 'PENDING',
    PREPARING = 'PREPARING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

@Entity({ name: 'order_batches' }) // Esto le dice a TypeORM que esta clase es una tabla llamada 'order_batches'
export class OrderBatch {

    @PrimaryGeneratedColumn('uuid') // Genera un ID único universal (mejor que un número para sistemas distribuidos)
    id!: string;

    @Column({ type: 'int' })
    quantity!: number; // La cantidad de platos solicitados

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status!: OrderStatus;

    @CreateDateColumn() // Columna para fecha en la que se solicitó la órden
    requestedAt!: Date;

    @CreateDateColumn() // Columna que se llena automáticamente con la fecha de creación
    createdAt!: Date;
}