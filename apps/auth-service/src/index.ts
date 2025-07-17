import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';

import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { healthRoutes } from './routes/health.routes';
import { userRoutes } from './routes/user.routes';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
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
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Microservicio de autenticación y autorización para el sistema de facturación',
      contact: {
        name: 'API Support',
        email: 'support@facturacion.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Desarrollo'
      },
      {
        url: 'https://api.facturacion.com/auth',
        description: 'Producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
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

if (process.env.ENABLE_SWAGGER !== 'false') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Auth Service API Documentation'
  }));
}

// Health check route
app.use('/health', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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
      auth: '/api/auth',
      users: '/api/users'
    }
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
  logger.info(`🚀 Auth Service running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    documentation: `http://localhost:${PORT}/docs`,
    timestamp: new Date().toISOString()
  });
});

export default app;
