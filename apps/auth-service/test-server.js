const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Configurar documentación API
const { setupSwagger } = require(
  path.join(__dirname, '../../config/auth-service-swagger')
);

const app = express();
const PORT = process.env.PORT || 3003;

console.log('🚀 Starting Auth Service Test...');

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
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service-test',
    timestamp: new Date().toISOString(),
  });
});

// Rutas básicas
app.get('/api/auth/test', (req, res) => {
  res.json({
    message: 'Auth service is working',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🔐 Auth Service Test running on port ${PORT}`);
  console.log(
    `📖 API Documentation available at: http://localhost:${PORT}/api-docs`
  );
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/auth/test`);
});
