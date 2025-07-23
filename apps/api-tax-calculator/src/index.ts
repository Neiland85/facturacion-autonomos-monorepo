import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware de seguridad
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
});
app.use(limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'tax-calculator-api',
    timestamp: new Date().toISOString(),
  });
});

// Rutas básicas de tax calculation
app.get('/api/calculate-tax', (req, res) => {
  res.json({
    message: 'Tax calculation endpoint',
    status: 'available',
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🧮 API Tax Calculator corriendo en puerto ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});
