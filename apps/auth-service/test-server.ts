import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

// Configurar documentación API
const { setupSwagger } = require('../config/auth-service-swagger');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware básico
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// Configurar documentación API
setupSwagger(app);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service-test',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
  });
});

app.listen(PORT, () => {
  console.log(`🔐 Auth Service Test running on port ${PORT}`);
  console.log(
    `📖 API Documentation available at: http://localhost:${PORT}/api-docs`
  );
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
