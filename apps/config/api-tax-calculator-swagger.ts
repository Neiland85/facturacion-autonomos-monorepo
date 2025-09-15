import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tax Calculator API',
      version: '1.0.0',
      description: 'API para cálculos fiscales de autónomos',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/*.js'], // Paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: any) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  app.get('/swagger.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};
