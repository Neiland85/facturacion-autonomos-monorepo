import { prisma } from '@facturacion/database';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';

// Importar middleware de seguridad completa
const { setupCompleteSecurity } = require('../../packages/security/src/complete-security');

const app = express();
const PORT = process.env.PORT || 3002;

// 🛡️ Configuración de seguridad completa con CSRF + Error Handling
setupCompleteSecurity(app, {
  enableCSRF: true,
  strictCSRF: process.env.NODE_ENV === 'production',
  enableErrorHandling: true,
  enableRequestLogging: true,
  requestTimeoutMs: 30000,
  enablePayloadLimit: true
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
    service: 'Invoice Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Ruta de estadísticas básicas
app.get('/api/invoices/stats', async (req: express.Request, res: express.Response) => {
  try {
    // Aquí irían las estadísticas reales con Prisma
    res.json({
      totalInvoices: 0,
      pendingInvoices: 0,
      completedInvoices: 0,
      totalAmount: 0,
      currency: 'EUR'
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: 'Error retrieving invoice statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Manejo de errores 404
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    service: 'Invoice Service'
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
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Invoice Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Stats endpoint: http://localhost:${PORT}/api/invoices/stats`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
