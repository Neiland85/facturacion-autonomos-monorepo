import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';
import { Request, Response, NextFunction } from 'express';

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Habilitar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
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
app.use('/api-docs', swaggerUi.serve, (req: Request, res: Response, next: NextFunction) => {
  swaggerUi.setup(swaggerDocument)(req, res, next);
});

// Ruta de ejemplo
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Servidor funcionando correctamente' });
});

// Middleware para manejar errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

export default app;
