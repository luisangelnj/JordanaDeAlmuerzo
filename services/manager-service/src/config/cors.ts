import { CorsOptions } from 'cors';
import dotenv from 'dotenv'
dotenv.config()


const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()) || [];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      // Permitir herramientas sin origin (Postman, curl)
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed from origin: ${origin}`));
    }
  },
  optionsSuccessStatus: 200
};

export default corsOptions;
