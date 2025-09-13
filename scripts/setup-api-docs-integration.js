#!/usr/bin/env node

/**
 * Script para integrar documentación OpenAPI con servicios en ejecución
 * Configura Swagger UI y Redoc en los servicios que lo necesiten
 */

const fs = require('fs');
const path = require('path');

// Configuración de servicios
const SERVICES_CONFIG = {
  'auth-service': {
    port: 3003,
    basePath: '/api',
    swaggerPath: '/api-docs',
    openapiFile: 'auth-service.openapi.yaml',
  },
  'invoice-service': {
    port: 3001,
    basePath: '/api',
    swaggerPath: '/api-docs',
    openapiFile: 'invoice-service.openapi.yaml',
  },
  'api-tax-calculator': {
    port: 3002,
    basePath: '/api',
    swaggerPath: '/api-docs',
    openapiFile: 'tax-calculator.openapi.yaml',
  },
  'api-facturas': {
    port: 3001,
    basePath: '/api/v1',
    swaggerPath: '/api-docs',
    openapiFile: 'facturas.openapi.yaml',
  },
};

// Función para generar configuración de Swagger para un servicio
function generateSwaggerConfig(serviceName, config) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.3',
      info: {
        title: `${serviceName} API`,
        version: '1.0.0',
        description: `Documentación API para ${serviceName}`,
      },
      servers: [
        {
          url: `http://localhost:${config.port}${config.basePath}`,
          description: 'Desarrollo',
        },
      ],
    },
    apis: [
      `./openapi/${config.openapiFile}`,
      `./apps/${serviceName}/src/**/*.ts`,
      `./packages/*/src/**/*.ts`,
    ],
  };

  return swaggerOptions;
}

// Función para crear middleware de documentación
function createSwaggerMiddleware(serviceName, config) {
  const middlewareCode = `'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuración de Swagger
const swaggerOptions = ${JSON.stringify(generateSwaggerConfig(serviceName, config), null, 2)};

// Generar especificación
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware para servir documentación
const setupSwagger = (app) => {
  // Ruta para JSON de la especificación
  app.get('${config.swaggerPath}.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Ruta para la interfaz Swagger UI
  app.use('${config.swaggerPath}', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customCss: \`
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50 }
    \`,
    customSiteTitle: \`${serviceName} API Documentation\`
  }));

  console.log(\`📖 Documentación API disponible en: http://localhost:${config.port}${config.swaggerPath}\`);
};

module.exports = { setupSwagger, swaggerSpec };
`;

  return middlewareCode;
}

// Función para crear configuración de Redoc
function createRedocConfig(serviceName, config) {
  const redocConfig = {
    title: `${serviceName} API Documentation`,
    version: '1.0.0',
    spec: {
      url: `${config.swaggerPath}.json`,
    },
    theme: {
      colors: {
        primary: {
          main: '#007bff',
        },
      },
      typography: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
      },
    },
    hideDownloadButton: false,
    hideHostname: false,
    expandResponses: '200,201',
    requiredPropsFirst: true,
    sortPropsAlphabetically: true,
    showExtensions: true,
  };

  return redocConfig;
}

// Función principal
function main() {
  console.log('🔧 Configurando integración de documentación API...\n');

  const scriptsDir = path.join(__dirname, '..', 'scripts');
  const docsDir = path.join(__dirname, '..', 'docs', 'api');

  // Crear directorio para configuraciones
  const configDir = path.join(__dirname, '..', 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Generar configuraciones para cada servicio
  Object.entries(SERVICES_CONFIG).forEach(([serviceName, config]) => {
    console.log('⚙️  Configurando ' + serviceName + '...');

    // Crear middleware de Swagger
    const swaggerMiddleware = createSwaggerMiddleware(serviceName, config);
    const middlewarePath = path.join(configDir, serviceName + '-swagger.js');

    fs.writeFileSync(middlewarePath, swaggerMiddleware, 'utf8');
    console.log('   ✅ Middleware creado: ' + middlewarePath);

    // Crear configuración de Redoc
    const redocConfig = createRedocConfig(serviceName, config);
    const redocPath = path.join(docsDir, serviceName + '-redoc-config.json');

    fs.writeFileSync(redocPath, JSON.stringify(redocConfig, null, 2), 'utf8');
    console.log('   ✅ Config Redoc creada: ' + redocPath);
  });

  // Crear script de ejemplo para integrar en servicios
  const integrationExample = `// Ejemplo de integración en un servicio Express
const express = require('express');
const { setupSwagger } = require('./config/serviceName-swagger');

const app = express();

// ... otras configuraciones del servicio ...

// Configurar documentación API
setupSwagger(app);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`🚀 serviceName ejecutándose en puerto \${PORT}\`);
  console.log(\`📖 Documentación: http://localhost:\${PORT}/api-docs\`);
});
`;

  const examplePath = path.join(docsDir, 'integration-example.js');
  fs.writeFileSync(examplePath, integrationExample, 'utf8');

  console.log('\n🎉 Configuración completada!\n');

  console.log('📋 Para integrar la documentación en un servicio:');
  console.log('1. Instalar dependencias:');
  console.log('   pnpm add swagger-jsdoc swagger-ui-express');
  console.log('');
  console.log('2. Importar y usar el middleware:');
  console.log(
    "   const { setupSwagger } = require('./config/[service-name]-swagger');"
  );
  console.log('   setupSwagger(app);');
  console.log('');
  console.log('3. Acceder a la documentación:');
  console.log('   http://localhost:[PORT]/api-docs');
  console.log('');
  console.log('📁 Archivos generados:');
  console.log('   - config/*-swagger.js (middlewares)');
  console.log('   - docs/api/*-redoc-config.json (configuraciones Redoc)');
  console.log('   - docs/api/integration-example.js (ejemplo de uso)');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  generateSwaggerConfig,
  createSwaggerMiddleware,
  createRedocConfig,
  SERVICES_CONFIG,
};
