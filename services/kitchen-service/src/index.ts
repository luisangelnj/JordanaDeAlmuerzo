import express from 'express';
import { startKitchenWorker } from './services/kitchen.worker';
import statusRoutes from './routes/kitchen.routes';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Define las rutas para consultar el estado
app.use('/api/kitchen', statusRoutes);

// Inicia el servidor Express para atender las peticiones del frontend
app.listen(PORT, () => {
    console.log(`Kitchen service API listening on port ${PORT}`);
    
    // De forma concurrente, inicia el worker para que escuche la cola de RabbitMQ
    console.log('Starting kitchen worker...');
    startKitchenWorker();
});