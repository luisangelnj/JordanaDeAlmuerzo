import express from 'express';
import { startMarketplaceWorker } from './services/marketplace.worker';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Marketplace service API listening on port ${PORT}`);
    
    // De forma concurrente, inicia el worker para que escuche la cola de RabbitMQ
    console.log('Starting marketplace worker...');
    startMarketplaceWorker();
});