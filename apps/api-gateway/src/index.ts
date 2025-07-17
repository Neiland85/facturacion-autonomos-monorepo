import cors from 'cors';
import express from 'express';
import promMiddleware from 'express-prometheus-middleware';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { errorHandler } from './middleware/error.middleware';
import { healthCheck } from './middleware/health.middleware';
import { requestLogger } from './middleware/logging.middleware';
import { setupRoutes } from './routes';
import { CircuitBreakerManager } from './services/circuit-breaker.service';
import { ServiceRegistry } from './services/service-registry.service';
import { logger } from './utils/logger';

const app = express();
const PORT = config.port || 4000;

// Inicializar servicios
const serviceRegistry = new ServiceRegistry();
const circuitBreaker = new CircuitBreakerManager();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: config.rateLimit.max, // límite de requests
  message: {
    error: 'Demasiadas solicitudes, inténtalo de nuevo más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Prometheus metrics
app.use(promMiddleware({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5, 2, 3, 5, 10],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check
app.use('/health', healthCheck);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Facturación Autónomos - API Gateway',
      version: '1.0.0',
      description: 'Gateway centralizado para todos los microservicios del sistema de facturación',
      contact: {
        name: 'API Support',
        email: 'api-support@facturacion-autonomos.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Desarrollo'
      },
      {
        url: 'https://api-staging.facturacion-autonomos.com',
        description: 'Staging'
      },
      {
        url: 'https://api.facturacion-autonomos.com',
        description: 'Producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Facturación Autónomos API'
}));

// Setup routes
setupRoutes(app, serviceRegistry, circuitBreaker);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    available_endpoints: '/docs'
  });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, () => {
  logger.info(`🚀 API Gateway ejecutándose en puerto ${PORT}`);
  logger.info(`📚 Documentación disponible en http://localhost:${PORT}/docs`);
  logger.info(`📊 Métricas disponibles en http://localhost:${PORT}/metrics`);
  logger.info(`❤️ Health check en http://localhost:${PORT}/health`);
  
  // Registrar servicios
  serviceRegistry.registerAllServices();
});

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  logger.info('Señal SIGTERM recibida, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Señal SIGINT recibida, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default app;
