import { prisma } from '@facturacion/database';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import facturasRoutes from './routes/facturas-simple';

// Importar middleware de seguridad completa
const { setupCompleteSecurity } = require('../../../packages/security/src/complete-security');

const app = express();
const PORT = process.env.PORT || 3001;

// 🛡️ Configuración de seguridad completa con CSRF + Error Handling
setupCompleteSecurity(app, {
  enableCSRF: true,
  strictCSRF: process.env.NODE_ENV === 'production',
  enableErrorHandling: true,
  enableRequestLogging: true,
  customCSRFIgnoreRoutes: ['/api/public'],
  requestTimeoutMs: 30000
});

// Middleware adicional
app.use(compression());
app.use(morgan('combined'));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ruta de health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'OK',
    service: 'API Facturas',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Rutas principales
app.use('/api/facturas', facturasRoutes);

// Manejo de errores 404
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});

// Manejo global de errores
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API de Facturas ejecutándose en puerto ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
