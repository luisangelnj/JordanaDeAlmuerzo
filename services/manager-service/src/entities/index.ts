// services/manager-service/src/entities/index.ts (Versión Corregida)

import { OrderBatch } from './OrderBatch.entity';
import { CachedInventory } from './CachedInventory.entity';
import { PurchaseHistory } from './PurchaseHistory.entity';
import { CachedRecipe } from './CachedRecipe.entity';

// En lugar de 'export *', importamos cada entidad y la exportamos explícitamente.
// Esto nos da control total y evita exportar tipos no deseados como los enums.
export {
    OrderBatch,
    CachedInventory,
    PurchaseHistory,
    CachedRecipe
};