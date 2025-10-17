import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { TransformController } from './controllers/transform.controller';

const app = express();
const port = process.env.PORT || 3004;

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'xml-transformer' });
});

// Rutas
app.post('/api/transform/facturae', TransformController.transform);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 XML Transformer Service escuchando en puerto ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`🔄 Transform endpoint: POST http://localhost:${port}/api/transform/facturae`);
});

export default app;