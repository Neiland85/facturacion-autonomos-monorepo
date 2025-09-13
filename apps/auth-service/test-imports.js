#!/usr/bin/env node

// Script simple para probar las importaciones
console.log('🧪 Probando importaciones del auth-service...\n');

try {
  console.log('✅ Importando errorHandler...');
  const { errorHandler } = require('./src/middleware/errorHandler.ts');
  console.log('✅ errorHandler importado correctamente');

  console.log('✅ Importando requestLogger...');
  const { requestLogger } = require('./src/middleware/logger.middleware.ts');
  console.log('✅ requestLogger importado correctamente');

  console.log('✅ Importando authRoutes...');
  const { authRoutes } = require('./src/routes/auth.routes.ts');
  console.log('✅ authRoutes importado correctamente');

  console.log('✅ Importando setupSwagger...');
  const { setupSwagger } = require('../config/auth-service-swagger.js');
  console.log('✅ setupSwagger importado correctamente');

  console.log('\n🎉 Todas las importaciones funcionan correctamente!');
} catch (error) {
  console.error('❌ Error en importación:', error.message);
  process.exit(1);
}
