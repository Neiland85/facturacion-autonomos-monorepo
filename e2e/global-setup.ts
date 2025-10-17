import { chromium, FullConfig } from '@playwright/test';

/**
 * Configuración global que se ejecuta antes de todos los tests E2E.
 * Se utiliza para:
 * - Configurar estado global de la aplicación
 * - Preparar base de datos de test
 * - Iniciar servicios mock si es necesario
 * - Configurar variables de entorno
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando configuración global de tests E2E...');

  // Verificar que las variables de entorno necesarias estén configuradas
  const requiredEnvVars = ['DATABASE_URL', 'PLAYWRIGHT_BASE_URL'];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Variables de entorno faltantes: ${missingVars.join(', ')}`
    );
    console.warn(
      '📝 Considera crear un archivo .env.test con las variables necesarias'
    );
  }

  // Verificar conectividad con la aplicación
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Intentar acceder a la URL base
    const baseURL = config.use?.baseURL || 'http://localhost:3000';
    console.log(`🔍 Verificando conectividad con ${baseURL}...`);

    await page.goto(baseURL, { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    console.log('✅ Aplicación accesible y funcionando');

    await browser.close();
  } catch (error) {
    console.error('❌ Error al conectar con la aplicación:', error);
    console.error(
      '💡 Asegúrate de que la aplicación esté ejecutándose en el puerto correcto'
    );
    throw error;
  }

  // Preparar directorios necesarios para reportes
  const fs = require('fs');
  const path = require('path');

  const dirs = [
    'test-results',
    'playwright-report',
    'e2e/screenshots',
    'e2e/videos',
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Directorio creado: ${dir}`);
    }
  });

  // Limpiar datos de sesiones anteriores si existen
  try {
    const sessionFile = path.join(
      process.cwd(),
      'test-results',
      'session.json'
    );
    if (fs.existsSync(sessionFile)) {
      fs.unlinkSync(sessionFile);
      console.log('🧹 Datos de sesión anteriores limpiados');
    }
  } catch (error) {
    console.warn(
      '⚠️  No se pudieron limpiar datos de sesión anteriores:',
      error
    );
  }

  console.log('✅ Configuración global completada');
}

export default globalSetup;
