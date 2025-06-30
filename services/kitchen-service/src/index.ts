import express from 'express';
import statusRoutes from './routes/kitchen.routes';

import { recipes } from './config/recipes';
import { startKitchenWorker } from './services/kitchen.worker';
import { startIngredientConfirmationConsumer } from './services/ingredient-confirmation.consumer';
import { publishRecipeList } from './services/recipe.publisher';

const RECIPE_LIST_QUEUE = 'recipe_list_queue';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Define las rutas para consultar el estado
app.use('/api/kitchen', statusRoutes);

// Inicia el servidor Express
app.listen(PORT, async () => {
    console.log(`Kitchen service API listening on port ${PORT}`);
    
    console.log('Starting Kitchen workers...');
    try {
        // Iniciar workers en paralelo
        await Promise.all([
            startKitchenWorker(),
            startIngredientConfirmationConsumer(),
            publishRecipeList()
        ]);
        console.log('All kitchen workers started successfully.');
    } catch (error) {
        console.error('Failed to start one or more kitchen workers:', error);
        process.exit(1);
    }
});