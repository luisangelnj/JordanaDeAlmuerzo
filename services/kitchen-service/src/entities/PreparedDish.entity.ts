import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn,
    Index
} from 'typeorm';

@Entity({ name: 'prepared_dishes' }) // Define el nombre de la tabla en la base de datos
export class PreparedDish {

    @PrimaryGeneratedColumn('uuid') // Un ID único para cada plato individual preparado
    id!: string;

    @Column({ type: 'varchar', length: 255 }) // El nombre del plato que se seleccionó aleatoriamente
    dishName!: string;

    @Index() // Añadimos un índice a esta columna para que las búsquedas por batchId sean muy rápidas
    @Column({ type: 'uuid' }) // El ID del lote al que pertenece este plato. Es el vínculo con la orden del manager.
    batchId!: string;

    @CreateDateColumn() // La fecha en que se registró la preparación de este plato
    createdAt!: Date;
}