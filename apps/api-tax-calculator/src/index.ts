import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { CronJobManager } from './cron/cron-manager';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { configuracionFiscalRoutes } from './routes/configuracion-fiscal.routes';
import { quarterClosureRoutes } from './routes/quarter-closure.routes';
import { taxRoutes } from './routes/tax.routes';
import { webhookRoutes } from './routes/webhook.routes';

const app = express();
const PORT = process.env.PORT || 3002;

// Inicializar cron jobs
const cronManager = new CronJobManager();

// Middleware de seguridad
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes, inténtalo de nuevo más tarde.',
  },
});
app.use(limiter);

// Middleware general
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'tax-calculator',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Rutas
app.use('/api/tax', taxRoutes);
app.use('/api/quarter-closure', quarterClosureRoutes);
app.use('/api/configuracion-fiscal', configuracionFiscalRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`Tax Calculator API corriendo en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);

  // Iniciar cron jobs
  cronManager.startCronJobs();
});

// Manejo de señales de cierre
process.on('SIGTERM', async () => {
  console.log('Señal SIGTERM recibida, cerrando servidor...');

  // Detener cron jobs
  await cronManager.shutdown();

  // Cerrar servidor
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('Señal SIGINT recibida, cerrando servidor...');

  // Detener cron jobs
  await cronManager.shutdown();

  // Cerrar servidor
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

const c = 3; // Selecciona la versión correcta
