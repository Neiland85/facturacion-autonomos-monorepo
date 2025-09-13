import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

// Configurar documentación API
const path = require('path');
const { setupSwagger } = require(
  path.join(__dirname, '../../config/auth-service-swagger')
);

const app = express();
const PORT = process.env.PORT || 3003;

console.log('🚀 Starting Auth Service...');

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar documentación API
setupSwagger(app);

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Rutas básicas
app.get('/api/auth/test', (req: express.Request, res: express.Response) => {
  res.json({
    message: 'Auth service is working',
    timestamp: new Date().toISOString(),
  });
});

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
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
);

app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on port ${PORT}`);
  console.log(
    `📖 API Documentation available at: http://localhost:${PORT}/api-docs`
  );
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/auth/test`);
});
