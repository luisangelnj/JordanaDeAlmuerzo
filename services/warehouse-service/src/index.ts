import express from 'express';
import { startWarehouseWorker } from './services/warehouse.worker';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Inicia el servidor Express para atender las peticiones del frontend
app.listen(PORT, () => {
    console.log(`Kitchen service API listening on port ${PORT}`);
    
    // De forma concurrente, inicia el worker para que escuche la cola de RabbitMQ
    console.log('Starting warehouse worker...');
    startWarehouseWorker();
});

