import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Importar nuestras rutas
import orderRoutes from './routes/order.routes';

import { startOrderCompletionConsumer } from './services/order-completion.consumer';
import { startInventoryConsumer } from './services/inventory.consumer'

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: 'http://localhost:5173', // <-- La URL de tu frontend
  optionsSuccessStatus: 200 
};

// --- Middlewares ---
app.use(cors(corsOptions));
app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: true }));

// --- Rutas ---
// Ruta de salud para verificar que el servicio está vivo
app.get('/', (req, res) => {
  res.status(200).send('Manager service is running');
});
// Rutas API
app.use('/api', orderRoutes);

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Manager service running on port ${PORT}`);

  //Iniciamos el worker para que escuche la cola de RabbitMQ
  console.log('Starting Manager workers...');
  try {
      await startOrderCompletionConsumer();
      await startInventoryConsumer()
      console.log('[+] All manager workers started successfully.');
  } catch (error) {
      console.error('Failed to start the Order Completion consumer:', error);
      process.exit(1);
  }

});