import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// Importar extensiones de números llamables
import './types/number-callable';

// Configurar documentación API
const { setupSwagger } = require(
  path.join(__dirname, '../../config/invoice-service-swagger')
);

const app: express.Application = express();
const PORT = process.env.PORT ?? 3001;

// Middleware de seguridad
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Configurar documentación API
setupSwagger(app);

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'invoice-service',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

// Rutas principales
app.get(
  '/api/invoices/stats',
  (req: express.Request, res: express.Response) => {
    res.json({
      message: 'Invoice service stats endpoint',
      totalInvoices: 0,
      pendingInvoices: 0,
      timestamp: new Date().toISOString(),
    });
  }
);

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    // Log error in production-safe way
    const errorMessage = err.message || 'Internal server error';
    res.status(500).json({
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
);

app.listen(PORT, () => {
  // Server started successfully
});

export default app;
