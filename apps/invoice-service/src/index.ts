import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';

import { errorHandler } from './middleware/errorHandler';
import { healthRoutes } from './routes/health.routes';
import { invoiceRoutes } from './routes/invoice.routes';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Invoice Service API',
      version: '1.0.0',
      description: 'Microservicio de gestión de facturas y documentos fiscales',
      contact: {
        name: 'API Support',
        email: 'support@facturacion.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Desarrollo',
      },
      {
        url: 'https://api.facturacion.com/invoices',
        description: 'Producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

if (process.env.ENABLE_SWAGGER !== 'false') {
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Invoice Service API Documentation',
    })
  );
}

// Health check route
app.use('/health', healthRoutes);

// API routes
app.use('/api/invoices', invoiceRoutes);

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      documentation: '/docs',
      health: '/health',
      invoices: '/api/invoices',
    },
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`🧾 Invoice Service running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    documentation: `http://localhost:${PORT}/docs`,
    timestamp: new Date().toISOString(),
  });
});

export default app;
