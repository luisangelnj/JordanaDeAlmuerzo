import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

export enum RequestStatus {
    PENDING_PURCHASE = 'PENDING_PURCHASE',
    READY_TO_PREPARE = 'READY_TO_PREPARE',
    COMPLETED = 'COMPLETED',
}

@Entity({ name: 'ingredient_requests' })
export class IngredientRequest {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index()
    @Column({ type: 'uuid' })
    batchId!: string;

    @Column({
        type: 'enum',
        enum: RequestStatus,
    })
    status!: RequestStatus;

    // Usamos una columna JSON para guardar fácilmente la lista de ingredientes
    @Column({ type: 'jsonb' }) 
    requestedIngredients!: object[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}