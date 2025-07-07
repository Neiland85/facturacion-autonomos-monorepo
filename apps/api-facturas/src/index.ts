import { PrismaClient } from '@prisma/client';
import compression from 'compression';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Importar rutas
import clientesRoutes from './routes/clientes';
import facturasRoutes from './routes/facturas';
import fiscalRoutes from './routes/fiscal';
import reportesRoutes from './routes/reportes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Configuración de OpenAPI/Swagger
const openApiSpec = YAML.load(path.join(__dirname, '../../../openapi/facturas.openapi.yaml'));

const swaggerOptions = {
  definition: {
    ...openApiSpec,
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.facturacion-autonomos.com/v1',
        description: 'Servidor de producción'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts'
  ]
};

const specs = swaggerJsdoc(swaggerOptions);

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  }
});
app.use('/api/', limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Documentación API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Facturación Autónomos API'
}));

// Servir especificación OpenAPI
app.get('/api/openapi.yaml', (req, res) => {
  res.setHeader('Content-Type', 'application/yaml');
  res.send(YAML.stringify(openApiSpec, 4));
});

app.get('/api/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'API Facturas',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: 'connected' // Verificar conexión real mediante Prisma
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Facturas - Sistema de Facturación para Autónomos',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      facturas: '/api/v1/facturas',
      clientes: '/api/v1/clientes',
      fiscal: '/api/v1/fiscal',
      reportes: '/api/v1/reportes'
    }
  });
});

// Middleware de autenticación (placeholder)
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token && process.env.NODE_ENV === 'production') {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token de autenticación requerido',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  
  // Implementar verificación real del token con JWT o similar
  // Por ahora, permitir el acceso para desarrollo
  console.log(`Token validation for ${req.path}: ${token ? 'provided' : 'missing'}`);
  next();
};

// Rutas principales de la API
app.use('/api/v1/facturas', authenticateToken, facturasRoutes);
app.use('/api/v1/clientes', authenticateToken, clientesRoutes);
app.use('/api/v1/fiscal', authenticateToken, fiscalRoutes);
app.use('/api/v1/reportes', authenticateToken, reportesRoutes);

// Manejo de errores 404
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'NOT_FOUND',
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Manejo global de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error global:', err);
  
  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      error: 'VALIDATION_ERROR',
      message: 'Los datos enviados no son válidos',
      details: err.details || [],
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  
  // Error genérico
  res.status(500).json({ 
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API de Facturas ejecutándose en puerto ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
  console.log(`📄 OpenAPI YAML: http://localhost:${PORT}/api/openapi.yaml`);
  console.log(`📄 OpenAPI JSON: http://localhost:${PORT}/api/openapi.json`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
