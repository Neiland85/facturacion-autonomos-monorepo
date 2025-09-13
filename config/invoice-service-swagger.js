'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuración de Swagger
const swaggerOptions = {
  "definition": {
    "openapi": "3.0.3",
    "info": {
      "title": "invoice-service API",
      "version": "1.0.0",
      "description": "Documentación API para invoice-service"
    },
    "servers": [
      {
        "url": "http://localhost:3001/api",
        "description": "Desarrollo"
      }
    ]
  },
  "apis": [
    "./openapi/invoice-service.openapi.yaml",
    "./apps/invoice-service/src/**/*.ts",
    "./packages/*/src/**/*.ts"
  ]
};

// Generar especificación
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware para servir documentación
const setupSwagger = (app) => {
  // Ruta para JSON de la especificación
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Ruta para la interfaz Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50 }
    `,
    customSiteTitle: `invoice-service API Documentation`
  }));

  console.log(`📖 Documentación API disponible en: http://localhost:3001/api-docs`);
};

module.exports = { setupSwagger, swaggerSpec };
