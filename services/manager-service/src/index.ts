import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar nuestras rutas
import orderRoutes from './routes/order.routes';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors());
app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: true }));

// --- Rutas ---
// Ruta de salud para verificar que el servicio está vivo
app.get('/', (req, res) => {
  res.status(200).send('Manager service is running');
});

// Usamos las rutas de órdenes bajo un prefijo, es una buena práctica para versionar la API.
app.use('/api', orderRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Manager service running on port ${PORT}`);
});