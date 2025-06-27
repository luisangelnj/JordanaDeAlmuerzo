import express from 'express';
import { startWarehouseWorker } from './services/warehouse.worker';
import { startPurchaseConsumer } from './services/purchase.consumer';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Inicia el servidor Express para atender las peticiones del frontend
app.listen(PORT, async () => {
    console.log(`Warehouse service API listening on port ${PORT}`);
    
    // Iniciamos el/los worker para que escuche la cola de RabbitMQ
    console.log('Starting warehouse worker/consumer...');
    try {
        await Promise.all([
            startWarehouseWorker(),
            startPurchaseConsumer()
        ]);
        console.log('All warehouse workers started successfully.');
    } catch (error) {
        console.error('Failed to start one or more warehouse workers:', error);
        process.exit(1); // Detiene el proceso si los workers no pueden iniciar
    }
});

