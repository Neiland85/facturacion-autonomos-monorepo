// Configuración del servidor para pruebas y producción
import express = require('express');
import router from './routes';
import * as dotenv from 'dotenv';
import pdfRoutes from './routes/pdfRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use('/api', router);

// Rutas para PDFs
app.use('/api/pdf', pdfRoutes);

// No incluimos Swagger para las pruebas

export default app;
