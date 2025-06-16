// Archivo principal del backend
import express from 'express';
import userRoutes from './routes/userRoutes';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Rutas
app.use('/api', userRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en el puerto ${PORT}`);
});
