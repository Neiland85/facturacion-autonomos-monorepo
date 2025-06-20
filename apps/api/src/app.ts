import express, { Request, Response } from 'express'; // Corregir importación de Response
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';

const app = express();

// Middleware para parsear JSON
app.use((req: Request, res: any, next: Function) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Manejo de errores al cargar openapi.yaml
let swaggerDocument;
try {
  swaggerDocument = yaml.load(
    fs.readFileSync(path.resolve(__dirname, '../openapi.yaml'), 'utf8')
  ) as Record<string, any>;
} catch (e) {
  console.error('Error al cargar el archivo openapi.yaml:', e);
  swaggerDocument = {}; // Cargar un documento vacío en caso de error
}

// Configurar Swagger UI correctamente con tipos
app.use('/api-docs', swaggerUi.serve, (req: Request, res: any, next: Function) => {
  swaggerUi.setup(swaggerDocument)(req, res, next);
});

// Middleware de ejemplo
app.use((req: Request, res: any, next: Function) => {
  console.log('Middleware ejecutado');
  next();
});

// Ruta de ejemplo
app.get('/health', (req: Request, res: any) => {
  res.status(200).json({ status: 'OK' });
});

// Ruta raíz
app.get('/', (req: Request, res: any) => {
  res.status(200).json({ message: 'Servidor funcionando correctamente' });
});

// Middleware para manejar errores
app.use((err: Error, req: Request, res: any, next: Function) => {
  console.error('Error capturado por el middleware:', err.message);

  res.status(500).json({
    error: 'Ocurrió un error inesperado en el servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
