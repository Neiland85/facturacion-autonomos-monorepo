'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const database_1 = require('@facturacion/database');
const compression_1 = __importDefault(require('compression'));
const cors_1 = __importDefault(require('cors'));
const express_1 = __importDefault(require('express'));
const express_rate_limit_1 = require('express-rate-limit');
const helmet_1 = __importDefault(require('helmet'));
const morgan_1 = __importDefault(require('morgan'));
const path = require('path');
const facturas_simple_1 = __importDefault(require('./routes/facturas-simple'));
// Configurar documentación API
const { setupSwagger } = require(
  path.join(__dirname, '../../../config/api-facturas-swagger')
);
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3004;
// Middleware de seguridad
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
// Rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
// Middleware para parsing JSON
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Configurar documentación API
setupSwagger(app);
// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'API Facturas',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});
// Rutas principales
app.use('/api/facturas', facturas_simple_1.default);
// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});
// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API de Facturas ejecutándose en puerto ${PORT}`);
  console.log(
    `📖 API Documentation available at: http://localhost:${PORT}/api-docs`
  );
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando servidor...');
  await database_1.prisma.$disconnect();
  process.exit(0);
});
exports.default = app;
