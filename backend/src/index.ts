// Archivo principal del backend
import app from './app';
import logger from './utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
});
