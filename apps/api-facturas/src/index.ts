import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import { rateLimit } from 'express-rate-limit';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'API Facturas',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas principales
app.get('/api/facturas', async (req, res) => {
  try {
    // TODO: Implementar lógica de facturas
    res.json({ 
      message: 'API de Facturas funcionando correctamente',
      data: [] 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/facturas', async (req, res) => {
  try {
    // TODO: Implementar creación de facturas
    res.status(201).json({ 
      message: 'Factura creada exitosamente',
      data: { id: 'temp-id' }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al crear la factura',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Manejo global de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

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
