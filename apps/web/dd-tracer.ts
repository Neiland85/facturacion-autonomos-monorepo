// apps/web/dd-tracer.ts

let tracer;

try {
  tracer = require('dd-trace').init({
    env: process.env.NODE_ENV || 'development',
    service: 'facturacion-frontend',
    version: '1.0.0',
    logInjection: true,
    runtimeMetrics: true
  });
} catch (error) {
  console.error('Error inicializando dd-trace:', error);
  tracer = null;
}

export default tracer;

