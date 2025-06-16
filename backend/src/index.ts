// Archivo principal del backend
import express = require('express');
import router from './routes';
import logger from './utils/logger';
import * as dotenv from 'dotenv';
import pdfRoutes from './routes/pdfRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Rutas
app.use('/api', router);

// Rutas para PDFs
app.use('/api/pdf', pdfRoutes);

// Documentación API - Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
});
