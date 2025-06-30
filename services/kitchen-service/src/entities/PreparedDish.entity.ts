import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn,
    Index,
    UpdateDateColumn 
} from 'typeorm';

// Posibles estados de un plato
export enum DishStatus {
    PENDING_INGREDIENTS = 'PENDING_INGREDIENTS',
    PREPARING = 'PREPARING',
    COMPLETED = 'COMPLETED',
}

@Entity({ name: 'prepared_dishes' }) // Define el nombre de la tabla en la base de datos
export class PreparedDish {

    @PrimaryGeneratedColumn('uuid') // Un ID único para cada plato individual preparado
    id!: string;

    @Column({ type: 'varchar', length: 255 }) // El nombre del plato que se seleccionó aleatoriamente
    dishName!: string;

    @Index() // Añadimos un índice a esta columna para que las búsquedas por batchId sean muy rápidas
    @Column({ type: 'uuid' }) // El ID del lote al que pertenece este plato. Es el vínculo con la orden del manager.
    batchId!: string;

    @Column({
        type: 'enum',
        enum: DishStatus,
        default: DishStatus.PENDING_INGREDIENTS, // El estado inicial por defecto
    })
    status!: DishStatus;

    @CreateDateColumn() // La fecha en que se registró la preparación de este plato
    createdAt!: Date;

    @UpdateDateColumn() // Útil para saber cuándo se actualizó por última vez
    updatedAt!: Date;
}