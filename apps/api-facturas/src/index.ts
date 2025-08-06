import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { prisma } from '@facturacion/database';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config';

// Importar configuraciones
import logger, { morganStream } from './config/logger';
import { register, metricsMiddleware } from './config/metrics';
import { swaggerSpec } from './config/swagger';

// Importar rutas
import facturaRoutes from './routes/factura.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(compression());

// Logging
app.use(morgan('combined', { stream: morganStream }));

// Métricas
app.use(metricsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger UI
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Facturas - Documentación',
  }));
}

// Ruta de health check
app.get('/health', async (req: express.Request, res: express.Response) => {
  try {
    // Verificar conexión a base de datos
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'OK',
      service: 'API Facturas',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({
      status: 'ERROR',
      service: 'API Facturas',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// Ruta de métricas Prometheus
app.get('/metrics', async (req: express.Request, res: express.Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error generating metrics', { error });
    res.status(500).end();
  }
});

// Ruta para obtener la especificación OpenAPI
app.get('/openapi.json', (req: express.Request, res: express.Response) => {
  res.json(swaggerSpec);
});

// Rutas principales
app.use('/api/facturas', facturaRoutes);

// Manejo de errores 404
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
  });
});

// Manejo global de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Errores conocidos
  if (err.message === 'Factura no encontrada') {
    return res.status(404).json({
      error: err.message,
    });
  }

  if (err.message.includes('Transición de estado inválida')) {
    return res.status(400).json({
      error: err.message,
    });
  }

  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info(`API de Facturas ejecutándose`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid,
  });
  
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`Documentación API disponible en http://localhost:${PORT}/api-docs`);
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} recibido, iniciando graceful shutdown`);
  
  server.close(() => {
    logger.info('Servidor HTTP cerrado');
  });

  try {
    await prisma.$disconnect();
    logger.info('Conexión a base de datos cerrada');
    process.exit(0);
  } catch (error) {
    logger.error('Error durante graceful shutdown', { error });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

export default app;